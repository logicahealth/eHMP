#
# Cookbook Name:: vx_solr
# Attributes: zookeeper
#
# Copyright 2015, Vistacore
#

default[:vx_solr][:zookeeper][:instances] = [
  {
    :hostname => "localhost",
    :client_port => 2181,
    :leader_port => 2888,
    :election_port => 3888
  }
]
default[:vx_solr][:zookeeper][:zookeeper_connection] = nil

default[:vx_solr][:zookeeper][:base_server_dir] = '/opt/zookeeper/zk-server'
default[:vx_solr][:zookeeper][:conf_dir] = "zookeeper/#{node[:'zookeeper-cluster'][:service][:version]}/zookeeper-#{node[:'zookeeper-cluster'][:service][:version]}/conf"
default[:vx_solr][:zookeeper][:config_filename] = 'zoo.cfg'
default[:vx_solr][:zookeeper][:base_data_dir] = '/opt/zookeeper/data/zk'
default[:vx_solr][:zookeeper][:base_log_dir] = '/opt/zookeeper/log/zk'
default[:vx_solr][:zookeeper][:properties] = {
  :tickTime => 2000,
  :initLimit => 10,
  :syncLimit => 5
}

default[:vx_solr][:zookeeper][:additional_jvm_flags] = "-Djute.maxbuffer=15000000"
