#
# Cookbook Name:: workstation
# Recipe:: default
#

#Load Nexus_url from common cookbook
include_recipe "common::load_nexus_url"
node.normal[:nexus_url] = node[:common][:nexus_url]

log 'nexus_url' do
  message node[:nexus_url]
  level :info
end
Chef::Log.info(node[:nexus_url])



include_recipe "workstation::#{node['platform_family']}"
