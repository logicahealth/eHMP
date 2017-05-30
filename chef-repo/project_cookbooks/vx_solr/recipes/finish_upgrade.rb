#
# Cookbook Name:: vx_solr
# Recipe:: finish_upgrade
#

directory node[:solr][:data_dir] do
  owner  'root'
  group  'root'
  mode   "0755"
end

directory node[:vx_solr][:log_dir] do
  owner  'root'
  group  'root'
  mode   "0755"
end

execute "copy solr vpr data" do
 command "cp -R #{node[:vx_solr][:upgrade_dir]}/solr/* #{node[:solr][:data_dir]}"
end

directory node[:vx_solr][:old_dir] do
  recursive true
  action :delete
  notifies :delete, "directory[#{node[:vx_solr][:upgrade_dir]}]", :immediately
end
