#
# Cookbook Name:: mocks
# Recipe:: correlated_ids
#

remote_file "#{Chef::Config[:file_cache_path]}/#{node[:mocks][:correlated_ids][:artifact_name]}" do
  owner 'root'
  group 'root'
  mode "0755"
  source node[:mocks][:correlated_ids][:source]
  use_conditional_get true
end

directory node[:mocks][:correlated_ids][:dir] do
  owner 'root'
  group 'root'
  mode '0755'
  recursive true
end

file node[:mocks][:correlated_ids][:json] do
  owner 'root'
  group 'root'
  mode "0755"
  content lazy{ File.read("#{Chef::Config[:file_cache_path]}/#{node[:mocks][:correlated_ids][:artifact_name]}") }
end
