#
# Cookbook Name:: jbpm
# recipe:: nerve
#

include_recipe 'nerve_wrapper'

nerve_wrapper 'jbpm' do
  host node[:ipaddress]
  port node[:jbpm][:server_port]
  checks node[:jbpm][:nerve][:checks]
  check_interval node[:jbpm][:nerve][:check_interval]
  service_type 'jbpm'
end
