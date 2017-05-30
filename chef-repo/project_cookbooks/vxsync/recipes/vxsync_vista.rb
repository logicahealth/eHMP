#
# Cookbook Name:: vxsync
# Recipe:: vxsync_vista
#

directory node[:vxsync][:vista][:home_dir] do
  owner  'root'
  group  'root'
  mode "0755"
  recursive true
  action :create
end

execute "install modules for vxsync_vista" do
  cwd node[:vxsync][:vista][:home_dir]
  command "npm install"
  action :nothing
  not_if { "#{node[:vxsync][:source]}".start_with?("http") }
end

execute "npm run install on xslt4node java for vxsync_vista" do
  cwd "#{node[:vxsync][:vista][:home_dir]}/node_modules/xslt4node/node_modules/java"
  command "npm run install"
  action :nothing
  not_if { "#{node[:vxsync][:source]}".start_with?("http") }
end

execute "extract_vxsync for vxsync_vista" do
  cwd node[:vxsync][:vista][:home_dir]
  command "unzip #{node[:vxsync][:artifact_path]}"
  action :run
  notifies :run, "execute[install modules for vxsync_vista]", :immediately
  notifies :run, "execute[npm run install on xslt4node java for vxsync_vista]", :immediately
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
  only_if { (Dir.entries(node[:vxsync][:vista][:home_dir]) - %w{ . .. }).empty? }
end

vista_sites = find_multiple_nodes_by_role("vista-.*", node[:stack])
if !node[:vxsync][:polled_vistas].nil?
  # if we are specifying which vistas to poll, remove all found vistas that aren't specified
  vista_sites = vista_sites.delete_if { |site| !node[:vxsync][:polled_vistas].include?(site['vista']['site_id']) }
  raise "Couldn't find every vista defined in polled_vistas attribute" if vista_sites.length < node[:vxsync][:polled_vistas].length
end

if find_optional_nodes_by_criteria(node[:stack], "role:jds_app_server").empty?
  raise "No JDS App Server has been found, yet you attempted to point to a jds_app_server" unless node[:vxsync][:vista][:jds_app_server_ident].nil?
  jds = find_node_by_role("jds", node[:stack])
else
  raise "JDS App Servers have been found in this environment, but a jds_app_server_ident was not set." if node[:vxsync][:vista][:jds_app_server_ident].nil?
  jds = find_optional_node_by_criteria(node[:stack], "role:jds_app_server AND jds_app_server_ident:#{node[:vxsync][:vista][:jds_app_server_ident]}")
  raise "JDS App Server #{node[:vxsync][:vista][:jds_app_server_ident]} not found in stack." if jds.nil?
end

pjds = find_node_by_role("pjds", node[:stack], "jds")
solr = find_node_by_role("solr", node[:stack], "mocks")
jmeadows = find_node_by_role("jmeadows", node[:stack], "mocks")
hdr_sites = find_multiple_nodes_by_role("hdr", node[:stack], "mocks")
vxsync = node

template "#{node[:vxsync][:vista][:home_dir]}/worker-config.json" do
  source 'worker-config.json.erb'
  variables(
    :vista_sites => vista_sites,
    :vxsync => vxsync,
    :jds => jds,
    :pjds => pjds,
    :solr => solr,
    :soap_handler => node[:soap_handler],
    :hdr_sites => hdr_sites,
    :jmeadows => jmeadows,
    :hdr_enabled => node[:vxsync][:hdr_enabled],
    :jmeadows_enabled => node[:vxsync][:jmeadows_enabled],
    :vler_enabled => node[:vxsync][:vler_enabled],
    :activity_filter_sites => node[:vxsync][:activity_filter_sites],
    :hdr_blacklist_sites => node[:vxsync][:hdr_blacklist_sites],
    :log_pattern => node[:vxsync][:vista][:log_pattern],
    :beanstalk_port => node[:vxsync][:vista][:beanstalk_processes][:jobrepo_vista][:config][:port]
  )
  owner 'root'
  group 'root'
  mode '0755'
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

directory "#{node[:vxsync][:vista][:log_directory]}" do
  owner 'root'
  group 'root'
  mode '0755'
  recursive true
  action :create
end

directory "#{node[:vxsync][:vista][:bluepill_log_dir]}" do
  owner  'root'
  group  'root'
  mode "0755"
  action :create
end

directory "#{node[:vxsync][:vista][:persistence_dir]}" do
  owner 'root'
  group 'root'
  mode '0755'
  action :create
end

directory "#{node[:vxsync][:vista][:data_dir]}" do
  owner 'root'
  group 'root'
  mode '0755'
  action :create
end

directory "#{node[:vxsync][:vista][:beanstalk_dir]}" do
  owner 'root'
  group 'root'
  mode '0755'
  action :create
end

vista_sites.each do |site|
  node.default[:vxsync][:vista][:processes]["pollerHost-#{site['vista']['site_id']}".to_sym] = {
      :template => "poller_host.sh.erb",
      :config => {
        :site => site['vista']['site_id']
      }
  }
end

node[:vxsync][:vista][:processes].each{ |name,process_block|
  1.upto(process_block[:number_of_copies] || 1) do |index|
    if index==1 then suffix = "" else suffix = "_#{index}" end
    template "#{node[:vxsync][:vista][:home_dir]}/#{name}#{suffix}.sh" do
      source process_block[:template]
      variables(
        :name => "#{name}#{suffix}",
        :options => process_block[:config],
        :process_log => "#{node[:vxsync][:vista][:log_directory]}/#{name}#{suffix}.log",
        :beanstalk_port => node[:vxsync][:vista][:beanstalk_processes][:jobrepo_vista][:config][:port]
      )
      owner 'root'
      group 'root'
      mode '0755'
      notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
    end
  end
}

template "/etc/init/vxsync_vista.conf" do
  variables(
    :name => "vxsync_vista",
    :depends_on => "beanstalk_vista",
    :level => 2345,
    :shutdown_script => "#{node[:vxsync][:vista][:home_dir]}/scripts/shutdownVxSync.sh"
  )
  source 'upstart-bluepill-vxsync.erb'
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

template "/etc/bluepill/vxsync_vista.pill" do
  source 'bluepill.pill.erb'
  variables(
    :name => "vxsync_vista",
    :processes => node[:vxsync][:vista][:processes],
    :working_directory => node[:vxsync][:vista][:home_dir],
    :log_directory => node[:vxsync][:vista][:bluepill_log_dir]
  )
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

node[:vxsync][:vista][:beanstalk_processes].each{ |name, process_block|
  template "#{node[:vxsync][:vista][:home_dir]}/#{name}.sh" do
    source process_block[:template]
    variables(
      :name => name,
      :options => process_block[:config],
      :process_log => "#{node[:vxsync][:vista][:log_directory]}/#{name}.log"
    )
    owner 'root'
    group 'root'
    mode '0755'
    notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
  end
}

template "/etc/init/beanstalk_vista.conf" do
  variables(
    :name => "beanstalk_vista",
    :dependency => "vxsync_vista",
    :vxsync_application_home => node[:vxsync][:vista][:home_dir],
    :beanstalk_dir => node[:vxsync][:vista][:beanstalk_dir],
    :level => 2345
  )
  source 'upstart-bluepill-beanstalk.erb'
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

template "/etc/bluepill/beanstalk_vista.pill" do
  source 'bluepill.pill.erb'
  variables(
    :name => "beanstalk_vista",
    :processes => node[:vxsync][:vista][:beanstalk_processes],
    :working_directory => node[:vxsync][:vista][:home_dir],
    :log_directory => node[:vxsync][:vista][:bluepill_log_dir]
  )
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

service "vxsync_vista" do
  provider Chef::Provider::Service::Upstart
  restart_command "/sbin/stop vxsync_vista; /sbin/start vxsync_vista"
  action [:enable]
end

service "beanstalk_vista" do
  provider Chef::Provider::Service::Upstart
  restart_command "/sbin/stop beanstalk_vista; /sbin/start beanstalk_vista"
  action [:enable]
end
