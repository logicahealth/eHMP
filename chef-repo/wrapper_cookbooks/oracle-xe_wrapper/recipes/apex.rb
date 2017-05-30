#
# Cookbook Name:: oracle-xe_wrapper
# Recipe:: apex
#

remote_file "#{Chef::Config['file_cache_path']}/#{node['oracle-xe_wrapper']['apex']['package']}.zip" do
  source node['oracle-xe_wrapper']['apex']['source']
  use_conditional_get true
  notifies :delete, "directory[#{node['oracle-xe_wrapper']['apex']['dir']}]", :immediately
end

directory node['oracle-xe_wrapper']['apex']['dir'] do
  recursive true
  notifies :run, "execute[unzip apex]", :immediately
end

execute "unzip apex" do
  cwd node['oracle-xe_wrapper']['apex']['dir']
  command "unzip #{Chef::Config['file_cache_path']}/#{node['oracle-xe_wrapper']['apex']['package']}.zip"
  action :nothing
  notifies :create, "template[#{node['oracle-xe_wrapper']['apex']['dir']}/install_apex.sql]", :immediately
  notifies :run, "execute[install apex]", :immediately
end

template "#{node['oracle-xe_wrapper']['apex']['dir']}/install_apex.sql" do
  variables node['oracle-xe_wrapper']['apex']['install_apex']
  action :nothing
end

execute "install apex" do
  cwd "#{node['oracle-xe_wrapper']['apex']['dir']}/apex"
  command "sudo -Eu oracle PATH=$PATH echo exit | sqlplus sys/#{node['oracle-xe']['oracle-password']} as sysdba@connect @#{node['oracle-xe_wrapper']['apex']['dir']}/install_apex.sql"
  sensitive true
  action :nothing
end
