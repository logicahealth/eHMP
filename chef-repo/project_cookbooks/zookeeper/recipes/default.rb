#
# Cookbook Name:: zookeeper
# Recipe:: default
#

unless node[:db_item].nil?
  db_attributes = Chef::EncryptedDataBagItem.load("zookeeper_env", node[:db_item], node[:data_bag_string])
  node.override[:zookeeper] = Chef::Mixin::DeepMerge.hash_only_merge(node[:zookeeper], db_attributes["zookeeper"])
end

include_recipe 'zookeeper-cluster_wrapper'

zookeeper_nodes = find_multiple_nodes_by_role("zookeeper", node[:stack])

# build hash of zookeeper ips
zk_ips = {}
zookeeper_nodes.each { |zk| zk_ips[zk[:zookeeper][:ident]] = zk[:ipaddress] }

# build instances hash using instance attribute and ip
instances = []
node[:zookeeper][:instances].each do |instance|
  # deep copy instance from attribute
  new_instance = {}
  instance.each { |key, val| new_instance[key.to_sym] = val }
  # set ip from ip hash
  new_instance[:hostname] = zk_ips[new_instance[:ident]]
  instances << new_instance
end

# build hash for instances that are to be created on current server
server_instances = {}
instances.each_with_index { |instance, index| server_instances[index + 1] = instance if instance[:ident] == node[:zookeeper][:ident] }

# create the zookeeper config for each instance
server_instances.each do |id, instance|
  zookeeper_config "zk_config_#{id}" do
    owner node[:'zookeeper-cluster'][:service_user]
    group node[:'zookeeper-cluster'][:service_group]
    instance_name instance[:hostname]
    path "#{node[:zookeeper][:base_server_dir]}-#{id}/#{node[:zookeeper][:conf_dir]}/#{node[:zookeeper][:config_filename]}"
    data_dir "#{node[:zookeeper][:base_data_dir]}#{id}"
    client_port instance[:client_port]
    leader_port instance[:leader_port]
    election_port instance[:election_port]
    properties node[:zookeeper][:properties]

    # the following two properties are added to the resource through the zookeeper helper library, not 3rd party cookbook
    instance_id id
    expanded_ensemble instances

    notifies :restart, "zookeeper_service[zk_service_#{id}]", :delayed
  end

  template "#{node[:zookeeper][:base_server_dir]}-#{id}/#{node[:zookeeper][:conf_dir]}/zookeeper-env.sh" do
    source "zookeeper-env.sh.erb"
    variables(
      :additional_jvm_flags => node[:zookeeper][:additional_jvm_flags],
      :log_dir => "#{node[:zookeeper][:base_log_dir]}#{id}",
      :zoo_instance_dir => "#{node[:zookeeper][:base_server_dir]}-#{id}"
    )
  end
end

# define and start the service for each instance, including log4j setup
server_instances.each do |id, instance|
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
  end

  template "#{node[:zookeeper][:base_server_dir]}-#{id}/#{node[:zookeeper][:conf_dir]}/log4j.properties" do
    source "log4j.properties.erb"
    variables(
      :log_dir => "#{node[:zookeeper][:base_log_dir]}#{id}"
    )
  end
end

# set the connection information for vxsync and rdk to use
node.default[:zookeeper][:zookeeper_connection] = instances.map { |instance|
  "#{instance[:hostname]}:#{instance[:client_port]}"
}.join(",")
