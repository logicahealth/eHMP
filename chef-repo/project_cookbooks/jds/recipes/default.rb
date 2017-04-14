#
# Cookbook Name:: jds
# Recipe:: default
#

gem_package 'greenletters'

include_recipe 'jds::cache'
include_recipe 'jds::config'
include_recipe 'jds::routines'
include_recipe 'jds::networking'
