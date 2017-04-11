#
# Cookbook Name:: no_internet
# Recipe:: default
#

include_recipe "packages::correct_ruby"
include_recipe "yum_wrapper"
include_recipe "rubygems_wrapper"
