#
# Cookbook Name:: ehmp-ui_provision
# Recipe:: default
#

include_recipe 'machine'
include_recipe "ehmp-ui_provision::#{node[:machine][:name]}"
