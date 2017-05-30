#
# Cookbook Name:: oracle_wrapper
# Recipe:: apex
#

remote_file "#{Chef::Config['file_cache_path']}/#{node['oracle_wrapper']['apex']['package']}.zip" do
  source node['oracle_wrapper']['apex']['source']
  use_conditional_get true
  notifies :delete, "directory[#{node['oracle_wrapper']['apex']['dir']}]", :immediately
end

directory node['oracle_wrapper']['apex']['dir'] do
  recursive true
  notifies :run, "execute[unzip apex]", :immediately
end

execute "unzip apex" do
  cwd node['oracle_wrapper']['apex']['dir']
  command "unzip #{Chef::Config['file_cache_path']}/#{node['oracle_wrapper']['apex']['package']}.zip"
  action :nothing
  notifies :create, "template[#{node['oracle_wrapper']['apex']['dir']}/install_apex.sql]", :immediately
  notifies :run, "execute[install apex]", :immediately
end

template "#{node['oracle_wrapper']['apex']['dir']}/install_apex.sql" do
  variables node['oracle_wrapper']['apex']['install_apex']
  action :nothing
end

datasource_password = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", node[:data_bag_string])["password"]

execute "install apex" do
  cwd "#{node['oracle_wrapper']['apex']['dir']}/apex"
  command "sudo -Eu oracle PATH=$PATH echo exit | sqlplus sys/#{datasource_password} as sysdba@connect @#{node['oracle_wrapper']['apex']['dir']}/install_apex.sql"
  sensitive true
  action :nothing
end
