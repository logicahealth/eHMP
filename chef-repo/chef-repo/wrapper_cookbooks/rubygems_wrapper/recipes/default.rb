#
# Cookbook Name:: rubygems_wrapper
# Recipe:: default
#

node.default[:rubygems_wrapper][:gem_server] = data_bag_item('servers', 'gem').to_hash

node.default[:rubygems][:gem_disable_default] = true,
node.default[:rubygems][:gem_sources] = [ "#{node[:rubygems_wrapper][:gem_server][:fqdn]}" ],
node.default[:rubygems][:chef_gem_disable_default] = true,
node.default[:rubygems][:chef_gem_sources] = [ "#{node[:rubygems_wrapper][:gem_server][:fqdn]}" ]

include_recipe 'rubygems'
