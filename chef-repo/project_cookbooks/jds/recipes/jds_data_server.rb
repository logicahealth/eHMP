#
# Cookbook Name:: jds
# Recipe:: jds_data_server
#

gem_package 'greenletters'

include_recipe 'jds::cache'
include_recipe 'jds::config'
include_recipe "jds::whitelist_app_server_ips"
include_recipe "jds::configure_ecp_settings"
include_recipe 'jds::deploy_ecp_dataserver'
include_recipe 'jds::restart'
include_recipe 'jds::networking'
