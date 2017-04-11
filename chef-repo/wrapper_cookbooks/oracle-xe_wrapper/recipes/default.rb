#
# Cookbook Name:: oracle-xe_wrapper
# Recipe:: default
#

include_recipe "oracle-xe_wrapper::swap"
include_recipe "oracle-xe"
include_recipe "oracle-xe_wrapper::env_vars"
