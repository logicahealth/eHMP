#
# Cookbook Name:: role_cookbook
# Recipe:: default
#

include_recipe "ohai"
include_recipe "timezone-ii"
include_recipe "ntp"
include_recipe "sssd_ldap_wrapper"
include_recipe "beats" if node[:beats][:logging]
include_recipe "beats::disable" unless node[:beats][:logging]

if node[:chef_provisioning][:driver_url] == "aws"
  node.default[:set_fqdn] = "#{node[:stack].gsub('.','-').gsub('build-','')}.vistacore.us"
else
  node.default[:set_fqdn] = "#{node[:chef_provisioning][:reference][:target_name].gsub('.','-').gsub('build-','')}.vistacore.us"
end
include_recipe "hostnames"

# override aws specific solr attributes here

node.default[:vx_solr][:bin_solr][:memory] = "1g"
