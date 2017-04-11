#
# Cookbook Name:: asu
# Recipe:: default
#

service_name = node[:asu][:service]

service service_name do
  provider Chef::Provider::Service::Upstart
  restart_command "/sbin/stop asu_server; /sbin/start asu_server"
  action [:enable, :start]
end
