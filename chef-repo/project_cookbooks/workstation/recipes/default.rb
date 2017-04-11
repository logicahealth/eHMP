#
# Cookbook Name:: workstation
# Recipe:: default
#

#Load Nexus_url from common cookbook
include_recipe "common::load_nexus_url"
node.default[:nexus_url] = node[:common][:nexus_url]



include_recipe "workstation::#{node['platform_family']}"
