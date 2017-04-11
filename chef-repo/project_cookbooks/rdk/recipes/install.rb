#
# Cookbook Name:: rdk
# Recipe:: install
#

remote_file "#{Chef::Config['file_cache_path']}/rdk.zip" do
  source node[:rdk][:source]
  mode   "0755"
  use_conditional_get true
  notifies :delete, "directory[#{node[:rdk][:home_dir]}]", :immediately
  not_if ("mountpoint -q #{node[:rdk][:home_dir]}")
end

directory node[:rdk][:home_dir] do
  mode "0755"
  recursive true
  action :create
end

directory node[:rdk][:log_dir] do
  mode "0755"
  recursive true
  action :create
end

# Run npm install only if using shared folders
execute "install modules" do
  cwd node[:rdk][:home_dir]
  command "npm install"
  action :run
  notifies :restart, "rdk_node_cluster[#{node[:rdk][:fetch_server][:service]}]"
  only_if ("mountpoint -q #{node[:rdk][:home_dir]}")
end

execute "install write modules" do
  cwd node[:rdk][:write_dir]
  command "npm install"
  action :run
  notifies :restart, "rdk_node_cluster[#{node[:rdk][:write_back][:service]}]"
  notifies :restart, "rdk_node_cluster[#{node[:rdk][:pick_list][:service]}]"
  only_if ("mountpoint -q #{node[:rdk][:home_dir]}")
end

# This is required because dev deploys create a hanging process which prevents the oracle
# npm module from being installed/updated.. Restarting the fetch_server process in this manner
# frees up the locked file/folder and allows the reinstll of the oracle module
# 
# This should only happen on 'dev' deploys and when the process is actually running.
execute 'restart the fetch_server on dev deploys' do
  command 'stop fetch_server ; start fetch_server'
  action :run
  only_if "mountpoint -q #{node[:rdk][:home_dir]}"
  only_if "/sbin/status #{node[:rdk][:fetch_server][:service]} | grep running", :user => "root"
end

execute "install oracledb module" do
  cwd node[:rdk][:home_dir]
  command "npm install oracledb@#{node[:rdk][:oracledb_module][:version]}"
  action :run
  notifies :restart, "rdk_node_cluster[#{node[:rdk][:fetch_server][:service]}]"
  only_if ("mountpoint -q #{node[:rdk][:home_dir]}")
end

execute "extract from ZIP" do
  cwd node[:rdk][:home_dir]
  command "unzip #{Chef::Config['file_cache_path']}/rdk.zip"
  action :run
  notifies :restart, "rdk_node_cluster[#{node[:rdk][:fetch_server][:service]}]"
  notifies :restart, "rdk_node_cluster[#{node[:rdk][:write_back][:service]}]"
  notifies :restart, "rdk_node_cluster[#{node[:rdk][:pick_list][:service]}]"
  only_if { (Dir.entries(node[:rdk][:home_dir]) - %w{ . .. }).empty? }
end

template "#{node[:rdk][:config][:xml_path]}/1305.xml" do
  source "1305.xml.erb"
  mode "644"
  variables({
  :processing_code => node[:rdk][:config][:processing_code]
  })
  action :create
end

template "#{node[:rdk][:config][:xml_path]}/1309.xml" do
  source "1309.xml.erb"
  mode "644"
  variables({
  :processing_code => node[:rdk][:config][:processing_code]
  })
  action :create
end
