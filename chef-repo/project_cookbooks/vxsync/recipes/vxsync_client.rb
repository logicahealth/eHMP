#
# Cookbook Name:: vxsync
# Recipe:: vxsync_client
#

directory node[:vxsync][:client][:home_dir] do
  owner  'root'
  group  'root'
  mode "0755"
  recursive true
  action :create
end

execute "install modules for vxsync_client" do
  cwd node[:vxsync][:client][:home_dir]
  command "npm install"
  action :nothing
  not_if { "#{node[:vxsync][:source]}".start_with?("http") }
end

execute "npm run install on xslt4node java for vxsync_client" do
  cwd "#{node[:vxsync][:client][:home_dir]}/node_modules/xslt4node/node_modules/java"
  command "npm run install"
  action :nothing
  not_if { "#{node[:vxsync][:source]}".start_with?("http") }
end

execute "extract_vxsync for vxsync_client" do
  cwd node[:vxsync][:client][:home_dir]
  command "unzip #{node[:vxsync][:artifact_path]}"
  action :run
  notifies :run, "execute[install modules for vxsync_client]", :immediately
  notifies :run, "execute[npm run install on xslt4node java for vxsync_client]", :immediately
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
  only_if { (Dir.entries(node[:vxsync][:client][:home_dir]) - %w{ . .. }).empty? }
end

vista_sites = find_multiple_nodes_by_role("vista-.*", node[:stack])
jds = find_node_by_role("jds", node[:stack])
pjds = find_node_by_role("pjds", node[:stack], "jds")
solr = find_node_by_role("solr", node[:stack], "mocks")
jmeadows = find_node_by_role("jmeadows", node[:stack], "mocks")
hdr_sites = find_multiple_nodes_by_role("hdr", node[:stack], "mocks")
vxsync = node

template "#{node[:vxsync][:client][:home_dir]}/worker-config.json" do
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
    :hdr_blacklist_sites => node[:vxsync][:hdr_blacklist_sites],
    :log_pattern => node[:vxsync][:client][:log_pattern],
    :beanstalk_port => node[:vxsync][:client][:beanstalk_processes][:jobrepo_client][:config][:port]
  )
  owner 'root'
  group 'root'
  mode '0755'
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

directory "#{node[:vxsync][:client][:log_directory]}" do
  owner 'root'
  group 'root'
  mode '0755'
  recursive true
  action :create
end

directory "#{node[:vxsync][:client][:bluepill_log_dir]}" do
  owner  'root'
  group  'root'
  mode "0755"
  action :create
end

directory "#{node[:vxsync][:client][:persistence_dir]}" do
  owner 'root'
  group 'root'
  mode '0755'
  action :create
end

directory "#{node[:vxsync][:client][:data_dir]}" do
  owner 'root'
  group 'root'
  mode '0755'
  action :create
end

directory "#{node[:vxsync][:client][:beanstalk_dir]}" do
  owner 'root'
  group 'root'
  mode '0755'
  action :create
end

if "#{node[:vxsync][:hdr_mode]}" == "PUB/SUB"
  puts "HDR IS IN PUB/SUB MODE!"
  hdr_sites.each do |hdr_site|
    hdr_site[:hdr][:hdr_sites].each do |site|
      node.default[:vxsync][:client][:processes]["pollerHost-#{site['site_id']}".to_sym] = {
        :template => "poller_host.sh.erb",
        :config => {
          :site => site['site_id']
        },
      }
    end
  end
end

node[:vxsync][:client][:processes].each{ |name,process_block|
  1.upto(process_block[:number_of_copies] || 1) do |index|
    if index==1 then suffix = "" else suffix = "_#{index}" end
    template "#{node[:vxsync][:client][:home_dir]}/#{name}#{suffix}.sh" do
      source process_block[:template]
      variables(
        :name => "#{name}#{suffix}",
        :options => process_block[:config],
        :process_log => "#{node[:vxsync][:client][:log_directory]}/#{name}#{suffix}.log",
        :beanstalk_port => node[:vxsync][:client][:beanstalk_processes][:jobrepo_client][:config][:port]
      )
      owner 'root'
      group 'root'
      mode '0755'
      notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
    end
  end
}

template "/etc/init/vxsync_client.conf" do
  variables(
    :name => "vxsync_client",
    :level => 2345,
    :shutdown_script => "#{node[:vxsync][:client][:home_dir]}/scripts/shutdownVxSync.sh"
  )
  source 'upstart-bluepill-vxsync.erb'
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

template "/etc/bluepill/vxsync_client.pill" do
  source 'bluepill.pill.erb'
  variables(
    :name => "vxsync_client",
    :processes => node[:vxsync][:client][:processes],
    :working_directory => node[:vxsync][:client][:home_dir],
    :log_directory => node[:vxsync][:client][:bluepill_log_dir]
  )
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

node[:vxsync][:client][:beanstalk_processes].each{ |name, process_block|
  template "#{node[:vxsync][:client][:home_dir]}/#{name}.sh" do
    source process_block[:template]
    variables(
      :name => name,
      :options => process_block[:config],
      :process_log => "#{node[:vxsync][:client][:log_directory]}/#{name}.log"
    )
    owner 'root'
    group 'root'
    mode '0755'
    notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
  end
}

template "/etc/init/beanstalk_client.conf" do
  variables(
    :name => "beanstalk_client",
    :vxsync_application_home => node[:vxsync][:client][:home_dir],
    :beanstalk_dir => node[:vxsync][:client][:beanstalk_dir],
    :level => 2345
  )
  source 'upstart-bluepill-beanstalk.erb'
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

template "/etc/bluepill/beanstalk_client.pill" do
  source 'bluepill.pill.erb'
  variables(
    :name => "beanstalk_client",
    :processes => node[:vxsync][:client][:beanstalk_processes],
    :working_directory => node[:vxsync][:client][:home_dir],
    :log_directory => node[:vxsync][:client][:bluepill_log_dir]
  )
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

service "vxsync_client" do
  provider Chef::Provider::Service::Upstart
  restart_command "/sbin/stop vxsync_client; /sbin/start vxsync_client"
  action [:enable]
end

service "beanstalk_client" do
  provider Chef::Provider::Service::Upstart
  restart_command "/sbin/stop beanstalk_client; /sbin/start beanstalk_client"
  action [:enable]
end

include_recipe 'vxsync::deploy_osync'
