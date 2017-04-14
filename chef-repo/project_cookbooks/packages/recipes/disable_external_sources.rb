#
# Cookbook Name:: no_internet
# Recipe:: default
#

include_recipe "yum_wrapper::disable_defaults"
include_recipe "rubygems_wrapper::remove_defaults"
