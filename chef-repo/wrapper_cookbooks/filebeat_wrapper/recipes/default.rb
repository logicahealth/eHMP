#
# Cookbook Name:: filebeat_wrapper
# Recipe:: default
#

node.set['filebeat']['config']['output']['elasticsearch']['hosts'] = ["#{node['beats']['instance_ip']}:9200"]
node.set['filebeat']['yum']['baseurl'] = "#{node[:nexus_url]}/nexus/content/repositories/yum-managed"

include_recipe "filebeat"

filebeat_prospector 'messages' do
 paths node['filebeat']['etc']['paths'].to_a
 document_type 'syslog'
 ignore_older '24h'
 scan_frequency '15s'
 harvester_buffer_size 16384
 fields 'type' => 'system_logs'
end