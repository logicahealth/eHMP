#
# Cookbook Name:: rdk
# Recipe:: default
#

include_recipe 'rdk::merge_db'

include_recipe 'nodejs_wrapper'
include_recipe 'bluepill_wrapper'

yum_package "libaio"

include_recipe 'oracle_wrapper::client'

yum_package "unzip"

include_recipe 'java_wrapper::remove_all_jdks'

include_recipe 'rdk::rdk_logrotate'
include_recipe 'rdk::service'
include_recipe 'ehmp_synapse'
include_recipe 'rdk::nerve'
include_recipe 'rdk::install'
include_recipe 'rdk::config'
include_recipe 'rdk::config_ssl'
include_recipe 'rdk::tools_activities'

include_recipe 'communications_cli'
