#
# Cookbook Name:: jds
# Recipe:: config
#
user_password = Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"]

directory(node[:jds][:jds_database_location]) do
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  recursive true
  mode "0750"
end

cookbook_file "vprnamespace.mac" do
  path "#{Chef::Config[:file_cache_path]}/vprnamespace.mac"
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  mode "0755"
  action :create
end

# Retrieve database encryption key and details from encrypted data bag
dbkeys = nil
begin
  dbkeys = Chef::EncryptedDataBagItem.load("cache", "db_keys", node[:data_bag_string])
rescue
  Chef::Log.warn "Did not find data bag item 'db_keys'"
end
cache_key_file = dbkeys["db_key_file"]
cache_key = Base64.decode64(dbkeys["db_key"])

file "#{node[:jds][:cache_mgr_dir]}/#{cache_key_file}" do
  content cache_key
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  mode "0640"
  action :create_if_missing
end

# Retrieve cache license from encrypted data bag
license_item = Chef::EncryptedDataBagItem.load(node[:jds][:cache_license_data_bag], node[:jds][:cache_license_item], node[:data_bag_string])
license_content = license_item["content"]

file "#{node[:jds][:cache_mgr_dir]}/cache.key" do
  content license_content
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  mode "0640"
  action :create
  notifies :execute, 'jds_key_block[key block]', :immediately
  notifies :restart, "service[#{node[:jds][:service_name]}]"
end

# Activate database encryption key and configure startup options
jds_key_block "key block" do
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  log node[:jds][:chef_log]
  action :nothing
end

user_export = Chef::EncryptedDataBagItem.load("jds_data", "user_export", node[:data_bag_string])["user_export"]

template "#{node[:jds][:cache_mgr_dir]}/Security.xml" do
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  variables(
      :users => user_export
  )
  mode "0640"
  source "Security.xml.erb"
  notifies :execute, 'jds_security_block[security block]', :immediately
end

# Set database security parameters
jds_security_block "security block" do
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  xml_path "#{node[:jds][:cache_mgr_dir]}/Security.xml"
  log node[:jds][:chef_log]
  action :nothing
end

# This is apache configuration for the embedded apache server in Cache 2014
template "#{node[:jds][:cache_dir]}/httpd/conf/httpd.conf" do
  source 'http.conf.erb'
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  mode '0755'
  notifies :restart, "service[#{node[:jds][:service_name]}]"
end

jds_mumps_block "create namespace" do
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  namespace "%SYS"
  command [
    "set RoutineFile = \"#{Chef::Config[:file_cache_path]}/vprnamespace.mac\"",
    "OPEN RoutineFile USE RoutineFile ZLOAD",
    "ZSAVE VPRNAMESPACE",
    "D CREATE^VPRNAMESPACE(\"#{node[:jds][:cache_namespace]}\", \"#{node[:jds][:jds_database_location]}\")"
  ]
  log node[:jds][:chef_log]
  not_if "echo -e \"i ##class(%SYS.Namespace).Exists(\\\"#{node[:jds][:cache_namespace]}\\\") w \\\"found\\\"\" | #{node[:jds][:session]} | grep \"found\"", :user => node[:jds][:install_user]
end

# make CSP.ini 600
file "#{node[:jds][:cache_dir]}/csp/bin/CSP.ini" do
  mode '0755'
end

# conditionally create or remove cron job to delete journal files
# This is disabled in production and production like environments
# In development this is enabled
clear_jds_journal_action = node[:jds][:clear_jds_journal] ? :create : :delete

cookbook_file "clear_jds_journal" do
  path "#{node[:jds][:cron_dir]}/clear_jds_journal"
  mode "0755"
  action clear_jds_journal_action
end
