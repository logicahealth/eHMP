#
# Cookbook Name:: mocks
# Recipe:: default
#

include_recipe 'java_wrapper'
include_recipe 'nodejs_wrapper'
include_recipe 'build-essential'
include_recipe "bluepill_wrapper"
include_recipe "mocks::base_line"
include_recipe "mocks::service_control"
include_recipe "mocks::deploy_node_mocks_artifact"
include_recipe "mocks::apache2_config"

yum_package "unzip"
yum_package "expect"

include_recipe "mocks::glassfish"
include_recipe "mocks::jmeadows" if node[:mocks][:include_jmeadows]
include_recipe "mocks::correlated_ids"
