#
# Cookbook Name:: beats
# Recipe:: default
#

logging_info = data_bag_item("servers", "logging")
node.override['beats']['instance_ip'] = logging_info['ip']
include_recipe "filebeat_wrapper"
include_recipe "topbeat_wrapper"