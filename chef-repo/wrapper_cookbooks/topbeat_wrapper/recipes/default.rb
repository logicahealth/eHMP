#
# Cookbook Name:: topbeat_wrapper
# Recipe:: default
#

node.set['topbeat']['config']['output']['elasticsearch']['hosts'] = ["#{node['beats']['instance_ip']}:9200"]

node.set['topbeat']['yum']['baseurl'] = "#{node[:nexus_url]}/nexus/content/repositories/yum-managed"

include_recipe "topbeat"

http_request 'template' do
  url "http://#{node['beats']['instance_ip']}:9200/_template/topbeat?pretty"
  message lazy { File.read('/etc/topbeat/topbeat.template.json') }
  action :put
end