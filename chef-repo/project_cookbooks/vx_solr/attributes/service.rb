#
# Cookbook Name:: vx_solr
# Attributes:: service
#

default[:vx_solr][:service][:script] = "#{node[:solr][:dir]}-#{node[:solr][:version]}/bin/solr"
default[:vx_solr][:service][:jvm_params] = "-Djute.maxbuffer=15000000"
default[:vx_solr][:service][:memory] = nil
default[:vx_solr][:service][:solr_host] = nil
default[:vx_solr][:service][:solr_instances] = 1
default[:vx_solr][:service][:'chef-rewind_version'] = "0.0.9"

# additional solr instances will use this port and the following ports (incrementing by 1)
default[:vx_solr][:service][:additional_instance_base_port] = 7574
