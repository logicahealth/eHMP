#
# Cookbook Name:: jds
# Recipe:: jds_app_server
#

gem_package 'greenletters'

include_recipe 'jds::cache'
include_recipe 'jds::config'
include_recipe "jds::configure_ecp_settings"
include_recipe 'jds::deploy_ecp_appserver'
include_recipe 'jds::zstu_ro'
include_recipe 'jds::jds_ro'
include_recipe 'jds::vprjconfig'
include_recipe 'jds::restart'
include_recipe 'jds::jds_data_stores'
include_recipe 'jds::networking'
