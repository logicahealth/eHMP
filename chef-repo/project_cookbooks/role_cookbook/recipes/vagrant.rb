#
# Cookbook Name:: role_cookbook
# Recipe:: vagrant
#

node.default[:development] = true

include_recipe "ohai"
include_recipe "timezone-ii"
include_recipe "ntp"