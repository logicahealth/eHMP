#
# Cookbook Name:: vxsync
# Recipe:: default
#

unless node[:db_item].nil?
  db_attributes = Chef::EncryptedDataBagItem.load("vxsync_env", node[:db_item], node[:data_bag_string])
  node.override[:vxsync] = Chef::Mixin::DeepMerge.hash_only_merge(node[:vxsync], db_attributes["vxsync"])
end

include_recipe 'vxsync::clear_logs' if node[:vxsync][:clear_logs]

include_recipe 'vxsync::base_line'

include_recipe 'vxsync::deploy_vxsync'

include_recipe 'vxsync::deploy_soap_handler'
