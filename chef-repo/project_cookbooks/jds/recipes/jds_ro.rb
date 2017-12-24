#
# Cookbook Name:: jds
# Recipe:: jds_ro
#

user_password = Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"]

# Copy JDS source code into namespace
remote_file "#{Chef::Config[:file_cache_path]}/jds.ro" do
  owner 'root'
  group 'root'
  mode '0755'
  source node[:jds][:source]
  notifies :execute, 'jds_ro_jds_install[jds.ro]', :immediately
end

# Install JDS source code into namespace
jds_ro_jds_install "jds.ro" do
  action :nothing
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  namespace node[:jds][:cache_namespace]
  source "#{Chef::Config[:file_cache_path]}/jds.ro"
  log node[:jds][:chef_log]
end
