#
# Cookbook Name:: oracle-xe_wrapper
# Recipe:: default
#

node.normal['oracle-xe']['oracle-password'] = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", node[:data_bag_string])["password"]
include_recipe "oracle-xe_wrapper::swap"
include_recipe "oracle-xe"
include_recipe "oracle-xe_wrapper::env_vars"
