#
# Cookbook Name:: asu
# recipe:: nerve
#

include_recipe "nerve_wrapper"

nerve_wrapper "asu" do
  host node[:ipaddress]
  port node[:asu][:server_port]
  checks node[:asu][:nerve][:checks]
  check_interval node[:asu][:nerve][:check_interval]
  service_type "asu"
end