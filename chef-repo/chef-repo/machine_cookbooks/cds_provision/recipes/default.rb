#
# Cookbook Name:: cds_provision
# Recipe:: default
#

include_recipe 'machine'
include_recipe "cds_provision::#{node[:machine][:name]}"
