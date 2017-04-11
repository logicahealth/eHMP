#
# Cookbook Name:: rdk
# Recipe:: service
#

rdk_node_cluster node[:rdk][:fetch_server][:service] do
  processes node[:rdk][:fetch_server][:processes]
  port node[:rdk][:fetch_server][:port]
  deploy_path node[:rdk][:fetch_server][:deploy_path]
  config_file node[:rdk][:fetch_server][:config_file]
  working_directory node[:rdk][:home_dir]
  dev_deploy node[:rdk][:dev_deploy]
  debug_port node[:rdk][:fetch_server][:debug_port]
  action [:create,:restart]
end

rdk_node_cluster node[:rdk][:write_back][:service] do
  processes node[:rdk][:write_back][:processes]
  port node[:rdk][:write_back][:port]
  deploy_path node[:rdk][:write_back][:deploy_path]
  config_file node[:rdk][:write_back][:config_file]
  working_directory node[:rdk][:home_dir]
  dev_deploy node[:rdk][:dev_deploy]
  debug_port node[:rdk][:write_back][:debug_port]
  action [:create,:restart]
end

rdk_node_cluster node[:rdk][:pick_list][:service] do
  processes node[:rdk][:pick_list][:processes]
  port node[:rdk][:pick_list][:port]
  deploy_path node[:rdk][:pick_list][:deploy_path]
  config_file node[:rdk][:pick_list][:config_file]
  working_directory node[:rdk][:home_dir]
  dev_deploy node[:rdk][:dev_deploy]
  debug_port node[:rdk][:pick_list][:debug_port]
  action [:create,:restart]
end
