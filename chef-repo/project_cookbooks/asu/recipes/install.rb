#
# Cookbook Name:: asu
# Recipe:: install
#

include_recipe 'java_wrapper'

include_recipe 'asu::base_line'

include_recipe 'asu::service_control'

include_recipe 'asu::deploy'

include_recipe 'asu::nerve'
