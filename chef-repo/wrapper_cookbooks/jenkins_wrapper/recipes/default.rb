#
# Cookbook Name:: jenkins_wrapper
# Recipe:: default
#

node.run_state[:jenkins_update_center_present] = true
include_recipe 'java_wrapper::default'
include_recipe 'jenkins::master'
include_recipe 'jenkins_wrapper::config'
