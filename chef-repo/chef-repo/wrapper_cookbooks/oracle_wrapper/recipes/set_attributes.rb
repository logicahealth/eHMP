#
# Cookbook Name:: oracle_wrapper
# Recipe:: set_attributes
#

node.default[:oracle][:rdbms][:sys_pw] = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", node[:data_bag_string])["password"]

node.default[:oracle][:rdbms][:dbs] = {}
node[:oracle_wrapper][:dbs].each do |db|
  node.default[:oracle][:rdbms][:dbs][db.to_sym] = false
end
