#
# Cookbook Name:: vxsync
# Recipe:: base_line
#

include_recipe 'java_wrapper'

include_recipe 'build-essential'

include_recipe 'nodejs_wrapper'

# When deploying with a Mac compiled artifact (dev deploy), we will need to recompile with the dev tools installed below.
include_recipe 'nodejs_wrapper::node_6_dev_tools' unless "#{node[:vxsync][:source]}".start_with?("http")

yum_package 'beanstalkd' do
  version node[:vxsync][:beanstalk_version]
  action :install
end

include_recipe "bluepill_wrapper"

user node[:vxsync][:user]

group node[:vxsync][:group] do
  members node[:vxsync][:user]
  action :create
end

include_recipe 'ehmp_synapse'
