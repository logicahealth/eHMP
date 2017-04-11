#
# Cookbook Name:: ehmp_provision
# Recipe:: default
#

include_recipe 'machine'
include_recipe "ehmp_provision::#{node[:machine][:name]}"

