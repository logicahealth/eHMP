#
# Cookbook Name:: ehmp_oracle
# Recipe:: communication
#

remote_directory node['ehmp_oracle']['communication']['sql_dir'] do
  source "oracledb"
end

template "#{node['ehmp_oracle']['communication']['sql_dir']}/create_tablespace_communication.sql" do
  variables(
    :tablespaces => node['ehmp_oracle']['communication']['tablespaces']
  )
end

user_communication = Chef::EncryptedDataBagItem.load("credentials", node['ehmp_oracle']['communication']['user_communication_item'], node[:data_bag_string])

template "#{node['ehmp_oracle']['communication']['sql_dir']}/create_user_communication.sql" do
  variables(
    :communication_username => user_communication['username'],
    :communication_password => user_communication['password'],
  )
  sensitive true
end

user_communicationuser = Chef::EncryptedDataBagItem.load("credentials", node['ehmp_oracle']['communication']['user_communicationuser_item'], node[:data_bag_string])

template "#{node['ehmp_oracle']['communication']['sql_dir']}/create_user_communicationuser.sql" do
  variables(
    :communicationuser_username => user_communicationuser['username'],
    :communicationuser_password => user_communicationuser['password']
  )
  sensitive true
end

datasource_password = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", node['data_bag_string'])["password"]

execute "communication schema install" do
  command "sqlplus -s /nolog <<-EOF>> #{node['ehmp_oracle']['communication']['sql_dir']}/install_log.txt
  WHENEVER OSERROR EXIT 9;
  WHENEVER SQLERROR EXIT SQL.SQLCODE;
  connect sys/#{datasource_password} as sysdba
  @#{node['ehmp_oracle']['communication']['sql_dir']}/install.sql
  EOF"
  sensitive true
end
