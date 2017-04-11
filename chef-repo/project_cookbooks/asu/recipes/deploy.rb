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

jds_node = find_node_by_role("jds", node[:stack])

template "#{node[:asu][:config_dir]}/application.properties" do
  source "asu.application.properties.erb"
  variables(
    :server_port => node[:asu][:server_port],
    :refresh_interval => node[:asu][:refresh_interval],
    :jds_ip => jds_node['ipaddress'],
    :jds_port => jds_node['jds']['cache_listener_ports']['vxsync'],
    :asu_ip => node['ipaddress']
  )
  notifies :restart, "service[#{node[:asu][:service]}]"
end
