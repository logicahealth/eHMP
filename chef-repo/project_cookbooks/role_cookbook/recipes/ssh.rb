#
# Cookbook Name:: role_cookbook
# Recipe:: ssh
#

# override prod specific solr attributes here

node.default[:vx_solr][:bin_solr][:memory] = "8g"
