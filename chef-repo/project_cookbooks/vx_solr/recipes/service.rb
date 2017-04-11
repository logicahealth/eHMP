#
# Cookbook Name:: vx_solr
# Recipe:: service
#

chef_gem "chef-rewind" do
  version node[:vx_solr][:ecryptfs][:'chef-rewind_version']
end

require 'chef/rewind'

# remove the service resource that was defined in the third party cookbook
# two reasons why we do this:
#   1. use the bin/solr script to start solr instead of solr.start
#   2. ecryptfs must be mounted before solr starts
unwind 'service[solr]'

template '/etc/init.d/solr' do
  source 'initd.erb'
  owner 'root'
  group 'root'
  mode '0755'
  variables(
    :log_file => node['solr']['log_file'],
  )
end

service 'solr' do
  supports :restart => true, :status => true
  action [:enable, :start]
end
