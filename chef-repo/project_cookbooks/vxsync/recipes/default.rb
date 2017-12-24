#
# Cookbook Name:: vxsync
# Recipe:: default
#

include_recipe 'vxsync::base_line'
include_recipe 'vxsync::artifact'
include_recipe 'vxsync::clear_logs' if node[:vxsync][:clear_logs]
include_recipe 'apm' if node[:vxsync][:enable_apm]
include_recipe 'app_dynamics' if node[:vxsync][:enable_app_dynamics]
