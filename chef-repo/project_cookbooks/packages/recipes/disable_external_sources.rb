#
# Cookbook Name:: no_internet
# Recipe:: default
#

include_recipe "yum_wrapper::disable_defaults"
include_recipe "rubygems_wrapper::remove_defaults"

node.normal[:mongodb][:install_method] = "internal_yum"
node.normal[:runit][:prefer_local_yum] = true
