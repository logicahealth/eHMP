#
# Cookbook Name:: asu
# Recipe:: deploy
#

raise %/

the node attribute's must be set

node[:asu][:source]

you should have set this in the vagrant configuration for chef.

/ if node[:asu][:source].nil? || node[:asu][:source].empty?

remote_file node[:asu][:artifact_path] do
  use_conditional_get true
  source node[:asu][:source]
  mode   "0755"
  notifies :stop, "service[#{node[:asu][:service]}]", :before
  notifies :delete, "directory[#{node[:asu][:home_dir]}]", :immediately
  notifies :delete, "directory[#{node[:asu][:base_dir]}]", :immediately
end

directory node[:asu][:home_dir] do
  owner node['asu']['user']
  group node['asu']['group']
  mode '0755'
  action :create
  recursive true
  notifies :run, "execute[#{node['asu']['home_dir']}_ownership_correction]", :immediately
end

execute "#{node['asu']['home_dir']}_ownership_correction" do
  command "chown -R #{node['asu']['user']}:#{node['asu']['group']} #{node['asu']['home_dir']}"
  action :nothing
  only_if { Dir.exist? node['asu']['home_dir'] }
end

common_extract node[:asu][:artifact_path] do
  directory node[:asu][:home_dir]
  owner node['asu']['user']
  action :extract_if_missing
end

directory node[:asu][:log_dir] do
  owner node['asu']['user']
  group node['asu']['group']
  mode '0755'
  action :create
  recursive true
  notifies :run, "execute[#{node['asu']['log_dir']}_ownership_correction]", :immediately
end

logrotate_app node[:asu][:logrotate][:name] do
  path node[:asu][:logrotate][:log_directory]
  options node[:asu][:logrotate][:options]
  enable true
  rotate node[:asu][:logrotate][:rotate]
  frequency node[:asu][:logrotate][:frequency]
  dateformat node[:asu][:logrotate][:dateformat]
end

execute "#{node['asu']['log_dir']}_ownership_correction" do
  command "chown -R #{node['asu']['user']}:#{node['asu']['group']} #{node['asu']['log_dir']}"
  action :nothing
  only_if { Dir.exist? node['asu']['log_dir'] }
end

directory node[:asu][:config_dir] do
  owner node['asu']['user']
  group node['asu']['group']
  mode '0755'
  action :create
  recursive true
end

directory node[:asu][:pid_dir] do
  owner node['asu']['user']
  group node['asu']['group']
  mode '0755'
  action :create
  recursive true
end

directory node[:asu][:base_dir] do
  owner node['asu']['user']
  group node['asu']['group']
  mode '0755'
  action :create
  recursive true
end

if find_optional_nodes_by_criteria(node[:stack], "role:jds_app_server").empty?
  raise "No JDS App Server has been found, yet you attempted to point to a jds_app_server" unless node[:asu][:jds_app_server_assignment].nil?
  jds = find_node_by_role("jds", node[:stack])
else
  raise "JDS App Servers have been found in this environment, but a jds_app_server_assignment was not set." if node[:asu][:jds_app_server_assignment].nil?
  jds = find_optional_node_by_criteria(node[:stack], "role:jds_app_server AND jds_app_server_ident:#{node[:asu][:jds_app_server_assignment]}")
  raise "JDS App Server #{node[:asu][:jds_app_server_assignment]} not found in stack." if jds.nil?
end

template "#{node[:asu][:config_dir]}/application.properties" do
  owner node['asu']['user']
  group node['asu']['group']
  source "asu.application.properties.erb"
  variables(
    :server_port => node[:asu][:server_port],
    :management_port => node[:asu][:management_port],
    :refresh_interval => node[:asu][:refresh_interval],
    :jds_ip => jds['ipaddress'],
    :jds_port => jds['jds']['cache_listener_ports']['vxsync'],
    :asu_ip => node['ipaddress'],
    :log_level => node[:asu][:log_level],
    :tomcat => node[:asu][:tomcat]
  )
  notifies :restart, "service[#{node[:asu][:service]}]"
end
