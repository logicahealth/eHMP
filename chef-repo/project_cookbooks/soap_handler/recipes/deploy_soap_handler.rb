#
# Cookbook Name:: vxsync
# Recipe:: deploy_soap_handler
#

user node[:soap_handler][:user]

group node[:soap_handler][:group] do
  members node[:soap_handler][:user]
  action :create
end

# Create soap handler log directory or update owner, group and mode if it exists
directory "#{node[:soap_handler][:soap_handler_log_dir]}" do
  owner  node[:soap_handler][:user]
  group  node[:soap_handler][:group]
  mode "0755"
  action :create
  recursive true
end

# Create soap handler bluepill log directory or update owner, group and mode if it exists
directory "#{node[:soap_handler][:bluepill_log_dir]}" do
  owner  node[:soap_handler][:user]
  group  node[:soap_handler][:group]
  mode "0755"
  action :create
  recursive true
end

include_recipe 'java_wrapper'

directory node[:terminology][:home_dir] do
  owner node['soap_handler']['user']
  group node['soap_handler']['group']
  mode "0755"
  recursive true
  notifies :run, "execute[#{node[:terminology][:home_dir]}_ownership_correction]", :immediately
end

execute "#{node[:terminology][:home_dir]}_ownership_correction" do
  command "chown -R #{node[:soap_handler][:user]}:#{node[:soap_handler][:group]} #{node[:terminology][:home_dir]}"
  action :nothing
  only_if { Dir.exist? node[:terminology][:home_dir] }
end

node[:terminology][:artifacts].each do |name, attributes|
  artifact_filename = "#{name}.zip"
  artifact_path = "#{Chef::Config['file_cache_path']}/#{artifact_filename}"
  artifact_fullname = "termdb-#{attributes[:version]}-#{name}"
  artifact_source = "#{node[:terminology][:nexus_base_url]}/#{attributes[:version]}/#{artifact_fullname}.zip"
  artifact_dir = "#{node[:terminology][:home_dir]}/#{attributes[:dir_name]}"

  remote_file artifact_path do
    use_conditional_get true
    source artifact_source
    mode   "0755"
    notifies :delete, "directory[#{artifact_dir}]", :immediately
  end

  directory artifact_dir do
    owner node['soap_handler']['user']
    group node['soap_handler']['group']
    recursive true
    action :nothing
  end

  execute "extract termdb #{artifact_filename}" do
    cwd node[:terminology][:home_dir]
    user node['soap_handler']['user']
    command "unzip #{artifact_path}"
    not_if { File.exists? artifact_dir }
    notifies :run, "execute[rename directory to #{attributes[:dir_name]}]", :immediately
    notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
  end

  execute "rename directory to #{attributes[:dir_name]}" do
    cwd node[:terminology][:home_dir]
    user node['soap_handler']['user']
    command "mv #{artifact_fullname} #{attributes[:dir_name]}"
    action :nothing
    notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
  end
end

directory node[:soap_handler][:home_dir] do
  owner node['soap_handler']['user']
  group node['soap_handler']['group']
  mode "0755"
  recursive true
  action :create
  notifies :run, "execute[#{node[:soap_handler][:home_dir]}_ownership_correction]", :immediately
end

execute "#{node[:soap_handler][:home_dir]}_ownership_correction" do
  command "chown -R #{node[:soap_handler][:user]}:#{node[:soap_handler][:group]} #{node[:soap_handler][:home_dir]}"
  action :nothing
  only_if { Dir.exist? node[:soap_handler][:home_dir] }
end

remote_file "#{node[:soap_handler][:artifact_path]}" do
  use_conditional_get true
  source node[:soap_handler][:source]
  mode   "0755"
end

file "#{node[:soap_handler][:home_dir]}/#{node[:soap_handler][:filename]}" do
  owner node['soap_handler']['user']
  group node['soap_handler']['group']
  mode   "0755"
  content lazy { IO.read(node[:soap_handler][:artifact_path]) }
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

hdr_sites = find_multiple_nodes_by_role("hdr", node[:stack], "mocks")
pgd = find_node_by_role("pgd", node[:stack], "mocks")
vler = find_node_by_role("vler", node[:stack], "mocks")
jmeadows = find_node_by_role("jmeadows", node[:stack], "mocks")
mvi = find_node_by_role("mvi", node[:stack], "mocks")
vxsync = node

template "#{node[:soap_handler][:home_dir]}/config.json" do
  source 'config.json.erb'
  owner node['soap_handler']['user']
  group node['soap_handler']['group']
  mode '0755'
  variables(
    :hdr_sites => hdr_sites,
    :pgd => pgd,
    :vler => vler,
    :jmeadows => jmeadows,
    :mvi => mvi,
    :soap_handler => node[:soap_handler],
    :vxsync => vxsync
  )
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

template "/etc/init/soap_handler.conf" do
  variables(
    :name => "soap_handler",
    :level => 2345
  )
  source 'upstart-bluepill.erb'
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

template "/etc/bluepill/soap_handler.pill" do
  source 'bluepill-soap_handler.pill.erb'
  variables(
    :name => "soap_handler",
    :start_command => "java -jar #{node[:soap_handler][:home_dir]}/#{node[:soap_handler][:filename]} server #{node[:soap_handler][:config_file]}",
    :working_directory => node[:soap_handler][:home_dir],
    :log_directory => node[:soap_handler][:bluepill_log_dir],
    :user => node[:soap_handler][:user],
    :group => node[:soap_handler][:group]
  )
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

service "soap_handler" do
  provider Chef::Provider::Service::Upstart
  restart_command "/sbin/stop soap_handler; /sbin/start soap_handler"
  action [:enable]
end
