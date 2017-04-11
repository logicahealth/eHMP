#
# Cookbook Name:: role_cookbook
# Recipe:: ssh
#

# override prod specific solr attributes here

include_recipe "role_cookbook::correct_ruby"

node.default[:vx_solr][:bin_solr][:memory] = "8g"
