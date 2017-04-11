#
# Cookbook Name:: jds
# Recipe:: routines
#

# This is apache configuration for the embedded apache server in Cache 2014
template "#{node[:jds][:cache_dir]}/httpd/conf/httpd.conf" do
  source 'http.conf.erb'
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  mode '0755'
  notifies :restart, "service[#{node[:jds][:cache_service]}]"
end

remote_file "#{Chef::Config[:file_cache_path]}/jds.ro" do
  owner 'root'
  group 'root'
  mode '0755'
  source node[:jds][:source]
  notifies :execute, 'jds_ro_jds_install[jds.ro]', :immediately
end

template "#{node[:jds][:cache_dir]}/zstu.ro" do
  owner "root"
  group "root"
  mode "0750"
  source "zstu.ro.erb"
  notifies :execute, 'jds_ro_install[zstu.ro]', :immediately
end

jds_ro_jds_install "jds.ro" do
  action :nothing
  namespace node[:jds][:cache_namespace]
  source "#{Chef::Config[:file_cache_path]}/jds.ro"
  log node[:jds][:chef_log]
end

jds_ro_install "zstu.ro" do
  action :nothing
  namespace "%SYS"
  source "#{node[:jds][:cache_dir]}/zstu.ro"
  log node[:jds][:chef_log]
end

cookbook_file "CACHEMAP.m" do
  path "#{Chef::Config[:file_cache_path]}/CACHEMAP.m"
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  mode "0640"
  action :create_if_missing
end

jds_mumps_block "Run JDS configuration" do
  namespace node[:jds][:cache_namespace]
  command [
    # Run configuration for JDS
    "d SETUP^VPRJCONFIG"
  ]
  log node[:jds][:chef_log]
end

jds_mumps_block "map XTMP & TMP to CACHETEMP" do
 namespace node[:jds][:cache_namespace]
 command [
   "set RoutineFile = \"#{Chef::Config[:file_cache_path]}/CACHEMAP.m\"",
   "OPEN RoutineFile USE RoutineFile ZLOAD",
   "ZSAVE CACHEMAP",
   "D ^CACHEMAP(\"CACHETEMP\",\"XTMP*\")",
   "D ^CACHEMAP(\"CACHETEMP\",\"TMP*\")"
 ]
 log node[:jds][:chef_log]
end

node[:jds][:data_store].each do |key,store|
  jds_mumps_block "Add configuration for #{key} data store" do
  namespace node[:jds][:cache_namespace]
  command [
    # Add configured data stores
    "D ADDSTORE^VPRJCONFIG(\"" + store + "\")"
  ]
  log node[:jds][:chef_log]
  end
end

# Restart cache server to ensure security settings are activated and that CACHETEMP and CACHE are encrypted
service "restart cache" do
  service_name node[:jds][:cache_service]
  action :restart
end

clear_jds_journal_action = node[:jds][:clear_jds_journal] ? :create : :delete
# Copy cron job to clear jds journal entries
cookbook_file "clear_jds_journal" do
  path "#{node[:jds][:cron_dir]}/clear_jds_journal"
  mode "0644"
  action clear_jds_journal_action
end