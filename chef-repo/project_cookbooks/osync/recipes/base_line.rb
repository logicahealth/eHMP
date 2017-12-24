#
# Cookbook Name:: osync
# Recipe:: base_line
#

include_recipe 'build-essential'

include_recipe 'nodejs_wrapper'

yum_package 'beanstalkd' do
  version node['osync']['beanstalk_version']
  action :install
end

include_recipe "bluepill_wrapper"
