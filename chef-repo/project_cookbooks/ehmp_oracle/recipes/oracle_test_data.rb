#
# Cookbook Name:: ehmp_oracle
# Recipe:: oracle_test_data
#

test_data_dir = node['ehmp_oracle']['oracle_config']['test_data_dir']
sys_password = data_bag_item("credentials", "oracle_user_sys", node[:data_bag_string])["password"]
test_data_discharge = "#{test_data_dir}/discharge.sql"

directory test_data_dir do
  owner "oracle"
  group node[node['ehmp_oracle']['oracle_service']]['group']
  mode "0755"
  recursive true
  action :create
end

remote_directory test_data_dir do
  source "oracledb/test_data"
  mode "0755"
end

ehmp_oracle_sqlplus "install_test_data" do
  install_file test_data_discharge
  connect_string "sys/#{sys_password} as sysdba"
  action :execute
  sensitive true
end