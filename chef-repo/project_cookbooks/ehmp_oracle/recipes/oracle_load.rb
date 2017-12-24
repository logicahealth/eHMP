#
# Cookbook Name:: ehmp_oracle
# Recipe:: oracledb
#
include_recipe "oracle_wrapper::env_vars"

remote_directory node['ehmp_oracle']['oracle_config']['utils_dir'] do
  source "oracledb/utils"
  mode "0755"
end

ehmp_oracle_ehmp_routing_users 'get provisioned users from pJDS'

ehmp_oracle_vista_divisions 'get vista divisions'
