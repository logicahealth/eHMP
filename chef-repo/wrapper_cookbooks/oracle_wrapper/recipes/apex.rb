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
  action :create
  owner 'oracle'
  group 'oinstall'
  mode '0755'
end

execute "unzip apex" do
  cwd node['oracle_wrapper']['apex']['dir']
  command "unzip #{Chef::Config['file_cache_path']}/#{node['oracle_wrapper']['apex']['package']}.zip"
  user "oracle"
  group "oinstall"
  notifies :create, "template[#{node['oracle_wrapper']['apex']['dir']}/install_apex.sql]", :immediately
  notifies :run, "execute[install apex]", :immediately
  only_if { (Dir.entries(node[:oracle_wrapper][:apex][:dir]) - %w{ . .. }).empty? }
end

template "#{node['oracle_wrapper']['apex']['dir']}/install_apex.sql" do
  variables node['oracle_wrapper']['apex']['install_apex']
  owner 'oracle'
  group 'oinstall'
  mode '0755'
  action :nothing
end

sys_password = data_bag_item("credentials", "oracle_user_sys", node[:data_bag_string])["password"]
install_file = "#{node['oracle_wrapper']['apex']['dir']}/install_apex.sql"

execute "install apex" do
  user 'oracle'
  environment(node['oracle_wrapper']['oracle_env'])
  cwd "#{node['oracle_wrapper']['apex']['dir']}/apex"
  command "sqlplus -s /nolog <<-EOF>> /tmp/apex_install.log
  SET FEEDBACK ON SERVEROUTPUT ON
  WHENEVER OSERROR EXIT 9;
  WHENEVER SQLERROR EXIT SQL.SQLCODE;
  connect sys/#{sys_password} as sysdba
  PROMPT #{install_file}
  @#{install_file}
  exit;
  EOF"
  sensitive true
  action :nothing
end
