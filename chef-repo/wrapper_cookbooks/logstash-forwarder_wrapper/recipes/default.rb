#
# Cookbook Name:: logstash-forwarder_wrapper
# Recipe:: default
#

node.set['logstash-forwarder']['repo']['url'] = "#{node[:nexus_url]}/nexus/content/repositories/yum-managed"

include_recipe 'logstash-forwarder'
