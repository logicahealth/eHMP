#
# Cookbook Name:: ehmp_oracle
# Recipe:: default
#

# Be sure swap is provisioned on dirty deploys
include_recipe "ehmp_oracle::swap"


# oracle_wrapper or oracle-xe_wrapper
if ::File.exists?("/etc/oratab")
  include_recipe "#{node['ehmp_oracle']['oracle_cookbook']}::env_vars"
else
  include_recipe "#{node['ehmp_oracle']['oracle_cookbook']}"
end

# Install gateways binaries if they don't aleardy exist - no path to update
if ! ::File.directory?("#{node[node['ehmp_oracle']['oracle_service']]['home']}/gateways")
	include_recipe "ehmp_oracle::gateway_config"
end