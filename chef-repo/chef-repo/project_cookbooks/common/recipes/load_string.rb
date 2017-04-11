#
# Cookbook Name:: common
# Recipe:: load_nexus_url
#

node.override[:common][:data_bag_string] = data_bag_item("string", "data_bag_key")['data_bag_key']
