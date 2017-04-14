#
# Cookbook Name:: oracle-xe_wrapper
# Recipe:: default
#

node.normal['oracle-xe']['oracle-password'] = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", node[:data_bag_string])["password"]
include_recipe "oracle-xe"
include_recipe "oracle-xe_wrapper::env_vars"
include_recipe "oracle-xe_wrapper::stig_script"


file "#{node[node['ehmp_oracle']['oracle_service']]['base']}/oraInst.loc" do
  owner "oracle"
  group 'dba'
  content "inst_group=dba\ninventory_loc=/u01/app/oraInventory"
end

directory node['oracle-xe']['ora_inventory'] do
  owner 'oracle'
  group 'dba'
  mode '0755'
  action :create
end