#
# Cookbook Name:: vx_solr
# Recipe: zookeeper
#
# Copyright 2016, Vistacore
#

include_recipe 'zookeeper-cluster_wrapper'

# create the zookeeper config for each instance
node[:vx_solr][:zookeeper][:instances].each_with_index do |instance, index|
  id = index + 1

  zookeeper_config "zk_config_#{id}" do
    owner node[:'zookeeper-cluster'][:service_user]
    group node[:'zookeeper-cluster'][:service_group]
    instance_name instance[:hostname]
    path "#{node[:vx_solr][:zookeeper][:base_server_dir]}-#{id}/#{node[:vx_solr][:zookeeper][:conf_dir]}/#{node[:vx_solr][:zookeeper][:config_filename]}"
    data_dir "#{node[:vx_solr][:zookeeper][:base_data_dir]}#{id}"
    client_port instance[:client_port]
    leader_port instance[:leader_port]
    election_port instance[:election_port]
    properties node[:vx_solr][:zookeeper][:properties]

    # the following two properties are added the resource through the zookeeper helper library, not 3rd party cookbook
    instance_id id
    expanded_ensemble node[:vx_solr][:zookeeper][:instances]

    notifies :restart, "zookeeper_service[zk_service_#{id}]", :delayed
  end

  template "#{node[:vx_solr][:zookeeper][:base_server_dir]}-#{id}/#{node[:vx_solr][:zookeeper][:conf_dir]}/zookeeper-env.sh" do
    source "zookeeper-env.sh.erb"
    variables(
      :additional_jvm_flags => node[:vx_solr][:zookeeper][:additional_jvm_flags]
    )
  end
end

# define and start the service for each instance
node[:vx_solr][:zookeeper][:instances].each_with_index do |instance, index|
  id = index + 1

  zookeeper_service "zk_service_#{id}" do
    user node[:'zookeeper-cluster'][:service_user]
    group node[:'zookeeper-cluster'][:service_group]
    config_path "#{node[:vx_solr][:zookeeper][:base_server_dir]}-#{id}/#{node[:vx_solr][:zookeeper][:conf_dir]}/#{node[:vx_solr][:zookeeper][:config_filename]}"
    data_dir "#{node[:vx_solr][:zookeeper][:base_data_dir]}#{id}"
    log_dir "#{node[:vx_solr][:zookeeper][:base_log_dir]}#{id}"
    version node[:'zookeeper-cluster'][:service][:version]
    binary_checksum node[:'zookeeper-cluster'][:service][:binary_checksum]
    binary_url node[:'zookeeper-cluster'][:service][:binary_url]
    install_path "#{node[:vx_solr][:zookeeper][:base_server_dir]}-#{id}"
  end
end

# set the connection information for vxsync and rdk to use
node.default[:vx_solr][:zookeeper][:zookeeper_connection] = node[:vx_solr][:zookeeper][:instances].map { |instance|
  "#{node[:ipaddress]}:#{instance[:client_port]}"
}.join(",")
