#
# Cookbook Name:: ehmp_oracle
# Recipe:: default
#

include_recipe 'build-essential'
# Be sure swap is provisioned on dirty deploys
include_recipe "ehmp_oracle::swap"

if ::File.exists?("/etc/oratab")
  include_recipe "oracle_wrapper::apex"
  include_recipe "oracle_wrapper::configure_tls"
else
  include_recipe "oracle_wrapper"
end

# Install gateways
include_recipe "ehmp_oracle::gateway_config"
include_recipe "ehmp_oracle::oracle_config"
include_recipe "ehmp_oracle::oracle_load"

include_recipe "ehmp_oracle::upgrade_scripts"
include_recipe "ehmp_oracle::oracle_patch"
