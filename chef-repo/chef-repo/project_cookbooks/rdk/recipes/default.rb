#
# Cookbook Name:: rdk
# Recipe:: default
#

include_recipe 'rdk::merge_db'

include_recipe 'java_wrapper'
include_recipe 'nodejs_wrapper'
include_recipe 'bluepill_wrapper'

yum_package "libaio"

include_recipe 'oracle_wrapper::client'

yum_package "unzip"

include_recipe 'rdk::rdk_logrotate'
include_recipe 'rdk::service'
include_recipe 'rdk::install'
include_recipe 'rdk::config'
include_recipe 'rdk::config_ssl'
