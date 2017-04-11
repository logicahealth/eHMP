#
# Cookbook Name:: role_cookbook
# Recipe:: default
#

include_recipe "role_cookbook::correct_ruby"
include_recipe "ohai"
include_recipe "timezone-ii"
include_recipe "ntp"
include_recipe "sssd_ldap_wrapper"
include_recipe "beats" if node[:beats][:logging]
include_recipe "beats::disable" unless node[:beats][:logging]

node.default[:set_fqdn] = "#{node[:chef_provisioning][:reference][:target_name]}.vistacore.us"
include_recipe "hostnames"

# override aws specific solr attributes here

node.default[:vx_solr][:bin_solr][:memory] = "1g"

