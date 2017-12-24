#
# Cookbook Name:: jds
# Recipe:: zstop_ro
#

user_password = Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"]

# Copy stop routine that is called by the init script
cookbook_file "#{node[:jds][:cache_dir]}/zstop.ro" do
  owner "root"
  group "root"
  mode "0755"
  source "zstop.ro"
  notifies :execute, 'jds_ro_install[zstop.ro]', :immediately
end

# Install stop routine to aid in shutdown
jds_ro_install "zstop.ro" do
  action :nothing
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  namespace "%SYS"
  source "#{node[:jds][:cache_dir]}/zstop.ro"
  log node[:jds][:chef_log]
end
