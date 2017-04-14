#
# Cookbook Name:: vxsync
# Recipe:: cleanup_old_vxsync
#

service "vxsync" do
  provider Chef::Provider::Service::Upstart
  action :nothing
end

service "beanstalk" do
  provider Chef::Provider::Service::Upstart
  action :nothing
end

directory node[:vxsync][:cleanup_old_vxsync][:old_home] do
  recursive true
  action :delete
  notifies :stop, "service[vxsync]", :before
  notifies :stop, "service[beanstalk]", :before
end
