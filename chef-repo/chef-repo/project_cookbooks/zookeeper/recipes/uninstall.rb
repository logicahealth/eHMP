#
# Cookbook Name:: zookeeper
# Recipe:: uninstall
#

# stop zookeeper instances
node[:zookeeper][:instances].each_with_index do |instance, index|
  id = index + 1

  # delete data directory
  directory "#{node[:zookeeper][:base_data_dir]}#{id}" do
    recursive true
    action :delete
  end

  zookeeper_service "zk_service_#{id}" do
    user node[:'zookeeper-cluster'][:service_user]
    group node[:'zookeeper-cluster'][:service_group]
    config_path "#{node[:zookeeper][:base_server_dir]}-#{id}/#{node[:zookeeper][:conf_dir]}/#{node[:zookeeper][:config_filename]}"
    data_dir "#{node[:zookeeper][:base_data_dir]}#{id}"
    log_dir "#{node[:zookeeper][:base_log_dir]}#{id}"
    version node[:'zookeeper-cluster'][:service][:version]
    binary_checksum node[:'zookeeper-cluster'][:service][:binary_checksum]
    binary_url node[:'zookeeper-cluster'][:service][:binary_url]
    install_path "#{node[:zookeeper][:base_server_dir]}-#{id}"

    action :disable
  end
end

# delete zookeeper directory
directory node[:zookeeper][:home_dir] do
  recursive true
  action :delete
end
