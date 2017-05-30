#
# Cookbook Name:: jds
# Recipe:: jds_data_server
#

gem_package 'greenletters'

include_recipe 'jds::cache'
include_recipe 'jds::config'
include_recipe 'jds::networking'
