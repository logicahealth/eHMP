#
# Cookbook Name:: vxsync
# Recipe:: base_line
#

include_recipe 'java_wrapper'

include_recipe 'build-essential'

include_recipe 'nodejs_wrapper'

# When deploying with a Mac compiled artifact (dev deploy), we will need to recompile with the dev tools installed below.
include_recipe 'nodejs_wrapper::node_6_dev_tools' unless "#{node[:vxsync][:source]}".start_with?("http")


# OSE/SMH Dec 28th 2017
#yum_package 'beanstalkd' do
#  version node[:vxsync][:beanstalk_version]
#  action :install
#end
remote_file "#{Chef::Config[:file_cache_path]}/daemonize-1.7.3-1.el6.x86_64.rpm" do
  source "https://nexus.osehra.org:8444/nexus/content/repositories/yum-managed/fakepath/daemonize/1.7.3-1.el6.x86_64.rpm/daemonize-1.7.3-1.el6.x86_64.rpm"
  action :create
end

package 'daemonize' do
  source "#{Chef::Config[:file_cache_path]}/daemonize-1.7.3-1.el6.x86_64.rpm"
  action :install
end

remote_file "#{Chef::Config[:file_cache_path]}/beanstalkd-1.10-2.el6.x86_64.rpm" do
  source "https://nexus.osehra.org:8444/nexus/content/repositories/yum-managed/fakepath/beanstalkd/1.10-2.el6.x86_64/beanstalkd-1.10-2.el6.x86_64.rpm"
  action :create
end

package 'beanstalkd' do
  source "#{Chef::Config[:file_cache_path]}/beanstalkd-1.10-2.el6.x86_64.rpm"
  action :install
end


include_recipe "bluepill_wrapper"

user node[:vxsync][:user]

group node[:vxsync][:group] do
  members node[:vxsync][:user]
  action :create
end

include_recipe 'ehmp_synapse'
