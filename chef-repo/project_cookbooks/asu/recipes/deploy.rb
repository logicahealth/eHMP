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
  mode '0755'
  action :create
  recursive true
end

execute "extract_artifact" do
  cwd node[:asu][:home_dir]
  command "unzip #{node[:asu][:artifact_path]}"
  only_if { (Dir.entries(node[:asu][:home_dir]) - %w{ . .. }).empty? }
end

directory node[:asu][:log_dir] do
  mode '0755'
  action :create
  recursive true
end

directory node[:asu][:config_dir] do
  mode '0755'
  action :create
  recursive true
end

directory node[:asu][:pid_dir] do
  mode '0755'
  action :create
  recursive true
end

directory node[:asu][:base_dir] do
  mode '0755'
  action :create
  recursive true
end

if find_optional_nodes_by_criteria(node[:stack], "role:jds_app_server").empty?
  raise "No JDS App Server has been found, yet you attempted to point to a jds_app_server" unless node[:asu][:jds_app_server_ident].nil?
  jds = find_node_by_role("jds", node[:stack])
else
  raise "JDS App Servers have been found in this environment, but a jds_app_server_ident was not set." if node[:asu][:jds_app_server_ident].nil?
  jds = find_optional_node_by_criteria(node[:stack], "role:jds_app_server AND jds_app_server_ident:#{node[:asu][:jds_app_server_ident]}")
  raise "JDS App Server #{node[:asu][:jds_app_server_ident]} not found in stack." if jds.nil?
end

template "#{node[:asu][:config_dir]}/application.properties" do
  source "asu.application.properties.erb"
  variables(
    :server_port => node[:asu][:server_port],
    :management_port => node[:asu][:management_port],
    :refresh_interval => node[:asu][:refresh_interval],
    :jds_ip => jds['ipaddress'],
    :jds_port => jds['jds']['cache_listener_ports']['vxsync'],
    :asu_ip => node['ipaddress'],
    :tomcat => node[:asu][:tomcat]
  )
  notifies :restart, "service[#{node[:asu][:service]}]"
end
