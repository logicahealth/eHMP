#
# Cookbook Name:: role_cookbook
# Recipe:: default
#

include_recipe "role_cookbook::correct_ruby"
include_recipe "ohai"
include_recipe "timezone-ii"
include_recipe "ntp"
include_recipe "sssd_ldap_wrapper"

# override aws specific solr attributes here

node.default[:vx_solr][:bin_solr][:memory] = "1g"

