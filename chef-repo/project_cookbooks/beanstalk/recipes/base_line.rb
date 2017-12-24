#
# Cookbook Name:: beanstalk
# Recipe:: base_line
#

yum_package 'beanstalkd' do
  version node['beanstalk']['beanstalk_version']
  action :install
end

include_recipe "bluepill_wrapper"
