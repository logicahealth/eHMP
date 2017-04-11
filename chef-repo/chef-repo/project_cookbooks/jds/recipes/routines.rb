#
# Cookbook Name:: jds
# Recipe:: routines
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

# Copy JDS source code into namespace
remote_file "#{node[:jds][:cache_dir]}/jds.ro" do
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
  source "#{node[:jds][:cache_dir]}/jds.ro"
  log node[:jds][:chef_log]
end

# Run JDS configuration setup
jds_mumps_block "Run JDS configuration" do
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  namespace node[:jds][:cache_namespace]
  command [
    "D SETUP^VPRJCONFIG"
  ]
  log node[:jds][:chef_log]
end

# Configure solr storage tracking if enabled
jds_mumps_block "Enable Solr storage tracking" do
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  namespace node[:jds][:cache_namespace]
  command [
    "S ^VPRCONFIG(\"sync\",\"status\",\"solr\")=#{node[:jds][:config][:trackSolrStorage] ? 1 : 0}"
  ]
  log node[:jds][:chef_log]
end

# Configure solr storage tracking domain exceptions if set
jds_mumps_block "Set Solr storage tracking exceptions" do
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  namespace node[:jds][:cache_namespace]
  command []
  node[:jds][:config][:solrStorageExceptions].each do |domain|
    command.push("S ^VPRCONFIG(\"sync\",\"status\",\"solr\",\"domainExceptions\",\"#{domain}\")=\"\"")
  end
  log node[:jds][:chef_log]
end

# Add configured Generic Data Stores
node[:jds][:data_store].each do |key,store|
  jds_mumps_block "Add configuration for #{key} data store" do
    cache_username node[:jds][:default_admin_user]
    cache_password user_password
    namespace node[:jds][:cache_namespace]
    command [
      "D ADDSTORE^VPRJCONFIG(\"" + store + "\")"
    ]
    log node[:jds][:chef_log]
  end
end

# Restart cache server to ensure new JDS source code is activated
service "restart cache" do
  service_name node[:jds][:service_name]
  action :restart
end
