#
# Cookbook Name:: zookeeper
# Attributes: default
#

default[:zookeeper][:instances] = [
  {
    :hostname => "localhost",
    :client_port => 2181,
    :leader_port => 2888,
    :election_port => 3888,
    :ident => "zookeeper"
  }
]
default[:zookeeper][:zookeeper_connection] = nil

default[:zookeeper][:home_dir] = '/opt/zookeeper'
default[:zookeeper][:base_server_dir] = "#{node[:zookeeper][:home_dir]}/zk-server"
default[:zookeeper][:conf_dir] = "zookeeper/#{node[:'zookeeper-cluster'][:service][:version]}/zookeeper-#{node[:'zookeeper-cluster'][:service][:version]}/conf"
default[:zookeeper][:config_filename] = 'zoo.cfg'
default[:zookeeper][:base_data_dir] = "#{node[:zookeeper][:home_dir]}/data/zk"
default[:zookeeper][:base_log_dir] = "#{node[:zookeeper][:home_dir]}/log/zk"
default[:zookeeper][:properties] = {
  :tickTime => 2000,
  :initLimit => 10,
  :syncLimit => 5,
  :maxClientCnxns => 500
}

default[:zookeeper][:additional_jvm_flags] = "-Djute.maxbuffer=15000000"

default[:zookeeper][:ident] = "zookeeper"

default[:zookeeper][:zookeeper_root_logger] = 'INFO, ROLLINGFILE'
default[:zookeeper][:zookeeper_console_threshold] = 'INFO'
default[:zookeeper][:zookeeper_log_dir] = "#{node[:zookeeper][:base_log_dir]}"
default[:zookeeper][:zookeeper_log_file] = 'zookeeper.log'
default[:zookeeper][:zookeeper_log_threshold] = 'INFO'
default[:zookeeper][:zookeeper_tracelog_file] = 'zookeeper_trace.log'
