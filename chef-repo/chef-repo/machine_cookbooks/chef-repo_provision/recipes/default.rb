#
# Cookbook Name:: chef-repo_provision
# Recipe:: default
#

include_recipe 'machine'
include_recipe "chef-repo_provision::#{node[:machine][:name]}"

