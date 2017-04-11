#
# Cookbook Name:: newrelic_wrapper
# Recipe:: default
#

node.normal['newrelic']['license'] = Chef::EncryptedDataBagItem.load("jenkins", "newrelic", node[:data_bag_string])["license_key"]

include_recipe "newrelic"