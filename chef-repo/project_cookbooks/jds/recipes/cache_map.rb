#
# Cookbook Name:: jds
# Recipe:: cache_map
#

user_password = Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"]

# Copy CACHEMAP that will remap globals and routines to a different namespace
cookbook_file "CACHEMAP.m" do
  path "#{Chef::Config[:file_cache_path]}/CACHEMAP.m"
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  mode "0755"
  action :create
end

# Map ^XTMP and ^TMP to the CACHETEMP namespace
# Also, map %ut* back to JDS namespace
jds_mumps_block "map XTMP & TMP to CACHETEMP" do
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  namespace node[:jds][:cache_namespace]
  command [
    "set RoutineFile = \"#{Chef::Config[:file_cache_path]}/CACHEMAP.m\"",
    "OPEN RoutineFile USE RoutineFile ZLOAD",
    "ZSAVE CACHEMAP",
    "D ^CACHEMAP(\"CACHETEMP\",\"XTMP*\")",
    "D ^CACHEMAP(\"CACHETEMP\",\"TMP*\")",
    "D ^CACHEMAP(\"#{node[:jds][:cache_namespace]}\",\"\%ut*\",\"\%ut*\")"
  ]
  log node[:jds][:chef_log]
end
