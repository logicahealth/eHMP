#
# Cookbook Name:: activity_handler
# Recipe:: uninstall
#

service "#{node[:activity_handler][:service_config][:name]} uninstall" do
  service_name node[:activity_handler][:service_config][:name]
  provider Chef::Provider::Service::Upstart
  action [:disable, :stop]
  only_if { File.exists?("/etc/bluepill/#{node[:activity_handler][:service_config][:name]}.pill") }
end

file "/etc/bluepill/#{node[:activity_handler][:service_config][:name]}.pill" do
  action :delete
  only_if { Dir.exists?('/etc/bluepill') }
end

directory node[:activity_handler][:home_dir] do
  recursive true
  action :delete
end

directory node[:activity_handler][:pid_dir] do
  recursive true
  action :delete
end
