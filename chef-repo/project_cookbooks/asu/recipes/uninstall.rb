#
# Cookbook Name:: asu
# Recipe:: remove
#

service node[:asu][:service] do
  provider Chef::Provider::Service::Upstart
  action [:disable, :stop]
end

file "/etc/init/#{node[:asu][:service]}.conf" do
  action :delete
end

file "/etc/bluepill/#{node[:asu][:service]}.pill" do
  action :delete
end

directory node[:asu][:home_dir] do
  recursive true
  action :delete
end

directory node[:asu][:log_dir] do
  recursive true
  action :delete
end

directory node[:asu][:config_dir] do
  recursive true
  action :delete
end

directory node[:asu][:pid_dir] do
  action :delete
  recursive true
end

directory node[:asu][:base_dir] do
  action :delete
  recursive true
end
