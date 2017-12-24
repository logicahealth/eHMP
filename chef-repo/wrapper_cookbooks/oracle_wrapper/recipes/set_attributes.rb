#
# Cookbook Name:: oracle_wrapper
# Recipe:: set_attributes
#

node.default[:oracle][:rdbms][:sys_pw] = data_bag_item("credentials", "oracle_user_sys", node[:data_bag_string])["password"]

node.default[:oracle][:rdbms][:dbs] = {}
node[:oracle_wrapper][:dbs].each do |db|
  node.default[:oracle][:rdbms][:dbs][db.to_sym] = false
end
