#
# Cookbook Name:: ehmp_oracle
# Recipe:: upgrade_scripts
#

remote_directory node['ehmp_oracle']['upgrade_scripts_dir'] do
  source "oracledb/oracle_upgrade"
  mode "0755"
end
