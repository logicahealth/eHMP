#
# Cookbook Name:: jds
# Recipe:: zstu_ro
#

user_password = Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"]

# Copy startup routine to start JDS listeners
template "#{node[:jds][:cache_dir]}/zstu.ro" do
  owner "root"
  group "root"
  mode "0755"
  source "zstu.ro.erb"
  notifies :execute, 'jds_ro_install[zstu.ro]', :immediately
end

# Install startup routine to start JDS listeners
jds_ro_install "zstu.ro" do
  action :nothing
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  namespace "%SYS"
  source "#{node[:jds][:cache_dir]}/zstu.ro"
  log node[:jds][:chef_log]
end
