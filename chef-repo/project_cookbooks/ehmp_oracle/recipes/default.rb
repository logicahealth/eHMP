#
# Cookbook Name:: ehmp_oracle
# Recipe:: default
#

# Be sure swap is provisioned on dirty deploys
include_recipe "ehmp_oracle::swap"


# oracle_wrapper or oracle-xe_wrapper
if ::File.exists?("/etc/oratab")
  include_recipe "#{node['ehmp_oracle']['oracle_cookbook']}::env_vars"
  include_recipe "#{node['ehmp_oracle']['oracle_cookbook']}::apex"
else
  include_recipe "#{node['ehmp_oracle']['oracle_cookbook']}"
end

# Install gateways
include_recipe "ehmp_oracle::gateway_config"

include_recipe "ehmp_oracle::oracle_config"
include_recipe "ehmp_oracle::communication"
