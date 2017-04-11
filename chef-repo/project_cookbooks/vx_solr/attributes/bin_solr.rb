#
# Cookbook Name:: vx_solr
# Attributes:: bin_solr
#

default[:vx_solr][:bin_solr][:script] = "#{node[:solr][:dir]}-#{node[:solr][:version]}/bin/solr"
default[:vx_solr][:bin_solr][:jvm_params] = nil
default[:vx_solr][:bin_solr][:memory] = nil
