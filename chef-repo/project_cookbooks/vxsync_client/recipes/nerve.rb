#
# Cookbook Name:: vxsync_client
# Recipe:: nerve
#

include_recipe "nerve_wrapper"

nerve_wrapper "vxsync_sync" do
  host node[:ipaddress]
  port node[:vxsync][:web_service_port]
  checks node[:vxsync_client][:vxsync_sync][:nerve][:checks]
  check_interval node[:vxsync_client][:vxsync_write_back][:nerve][:check_interval]
  service_type "vxsync_sync"
end

nerve_wrapper "vxsync_write_back" do
  host node[:ipaddress]
  port node[:vxsync_client][:processes][:'writeback-endpoint'][:config][:port]
  checks node[:vxsync_client][:vxsync_write_back][:nerve][:checks]
  check_interval node[:vxsync_client][:vxsync_write_back][:nerve][:check_interval]
  service_type "vxsync_write_back"
end
