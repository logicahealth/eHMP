#
# Cookbook Name:: rdk
# Recipe:: logstash
#

node.set['logstash-forwarder']['logstash_servers'] = [ "#{node[:rdk][:audit_host]}:#{node[:rdk][:audit_port]}" ]

include_recipe 'logstash-forwarder_wrapper'

log_forward 'rdk' do
  paths ["#{node[:rdk][:audit_log_path]}"]
  fields types: 'syslog'
end
