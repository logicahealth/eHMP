#
# Cookbook Name:: solr_wrapper
# Recipe:: default
#

include_recipe 'java_wrapper'

user node['solr']['user']

group node['solr']['group'] do
  members node['solr']['user']
  action :create
end

extract_path = "#{node['solr']['dir']}-#{node['solr']['version']}"
execute 'chown solr extract directory to solr user' do
  command "chown -R #{node['solr']['user']}:#{node['solr']['group']} #{extract_path}"
  action :nothing
  notifies :stop, "service[solr]", :before
  subscribes :run, "directory[#{node['solr']['data_dir']}]", :immediately
end

include_recipe 'solr'
