#
# Cookbook Name:: rdk_provision
# Recipe:: default
#

include_recipe 'machine'
include_recipe "rdk_provision::#{node[:machine][:name]}"
