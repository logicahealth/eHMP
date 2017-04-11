#
# Cookbook Name:: role_cookbook
# Recipe:: vagrant
#

include_recipe "role_cookbook::correct_ruby"

node.default[:development] = true

include_recipe "ohai"
include_recipe "timezone-ii"
include_recipe "ntp"
