#
# Cookbook Name:: vx_solr
# Attributes:: default
#

default[:vx_solr][:server_dir] = "#{node[:solr][:dir]}-#{node[:solr][:version]}/server"
default[:vx_solr][:resources_dir] =  "#{node[:vx_solr][:server_dir]}/resources"
default[:vx_solr][:log_dir] = "/var/log/solr"
default[:vx_solr][:old_dir] = node[:solr][:dir]
default[:vx_solr][:old_server_dir] = "#{node[:vx_solr][:old_dir]}/server"
default[:vx_solr][:upgrade_dir] = "#{node[:solr][:dir]}/upgrade"
default[:vx_solr][:cron_dir] = "/etc/cron.d"
