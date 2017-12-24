#
# Cookbook Name:: zookeeper-cluster_wrapper
# Recipe:: default
#

include_recipe 'java_wrapper'

user node['zookeeper-cluster']['service_user']

group node['zookeeper-cluster']['service_group'] do
  members node['zookeeper-cluster']['service_user']
  action :create
end
