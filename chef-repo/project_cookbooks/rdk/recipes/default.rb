#
# Cookbook Name:: rdk
# Recipe:: default
#

include_recipe 'java_wrapper'
include_recipe 'nodejs_wrapper'
include_recipe 'bluepill_wrapper'

yum_package "libaio"

include_recipe 'oracle_wrapper::client'

yum_package "unzip"

include_recipe 'rdk::rdk_logstashforwarder'
include_recipe 'rdk::rdk_logrotate'
include_recipe 'rdk::install'
include_recipe 'rdk::service'
