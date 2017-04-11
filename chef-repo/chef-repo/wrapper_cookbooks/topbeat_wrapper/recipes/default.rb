#
# Cookbook Name:: topbeat_wrapper
# Recipe:: default
#

node.set['topbeat']['config']['output']['elasticsearch']['hosts'] = ["#{node['beats']['instance_ip']}:9200"]

node.set['topbeat']['yum']['baseurl'] = "#{node[:nexus_url]}/nexus/content/repositories/yum-managed"

include_recipe "topbeat"
