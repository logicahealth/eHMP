#
# Cookbook Name:: jds
# Recipe:: config
#

[node[:jds][:cache_jsonvpr_vista_dir], node[:jds][:cache_jsonvpr_dir]].each do |dir|
  directory(dir) do
    owner node[:jds][:cache_user]
    group node[:jds][:cache_user]
    mode "0750"
  end
end

cookbook_file "vprnamespace.mac" do
  path "#{Chef::Config[:file_cache_path]}/vprnamespace.mac"
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  mode "0640"
  action :create_if_missing
end

# Retrieve cache license from encrypted data bag
# license_item = Chef::EncryptedDataBagItem.load(node[:jds][:cache_license_data_bag], node[:jds][:cache_license_item], 'n25q2mp#h4')
# license_content = license_item["content"]


# file "#{node[:jds][:cache_mgr_dir]}/cache.key" do
#   content license_content
#   owner node[:jds][:cache_user]
#   group node[:jds][:cache_user]
#   mode "0640"
#   action :create
# end

#Retrive cache license from host licenses location
remote_file "Cache server license key" do
  path "#{node[:jds][:cache_mgr_dir]}/cache.key"
  source "file:///opt/private_licenses/cache_server/cache.key"
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  mode "0640"
end


# Retrieve database encryption key and details from encrypted data bag
dbkeys = nil
begin
  dbkeys = Chef::EncryptedDataBagItem.load("cache", "db_keys", 'n25q2mp#h4')
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

template "#{node[:jds][:cache_mgr_dir]}/EncryptAudit.xml" do
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  mode "0640"
  source "EncryptAudit.xml.erb"
end

template "#{node[:jds][:cache_mgr_dir]}/SecureConfiguration.xml" do
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  mode "0640"
  source "SecureConfiguration.xml.erb"
end

# Activate database encryption key and configure startup options
jds_key_block "key block" do
  log node[:jds][:chef_log]
  only_if { node[:jds][:build_jds] }
end

# Set database security parameters
jds_security_block "security block" do
  log node[:jds][:chef_log]
  only_if { node[:jds][:build_jds] }
end

jds_mumps_block "create namespace" do
  namespace "%SYS"
  command [
    "set RoutineFile = \"#{Chef::Config[:file_cache_path]}/vprnamespace.mac\"",
    "OPEN RoutineFile USE RoutineFile ZLOAD",
    "ZSAVE VPRNAMESPACE",
    "D CREATE^VPRNAMESPACE(\"#{node[:jds][:cache_namespace]}\", \"#{node[:jds][:cache_jsonvpr_dir]}\")"
  ]
  log node[:jds][:chef_log]
  not_if "echo -e \"i ##class(%SYS.Namespace).Exists(\\\"#{node[:jds][:cache_namespace]}\\\") w \\\"found\\\"\" | #{node[:jds][:session]} | grep \"found\""
end

# make CSP.ini 600
file "#{node[:jds][:cache_dir]}/csp/bin/CSP.ini" do
  mode '0640'
end

file "#{node[:jds][:cache_jsonvpr_dir]}/CACHE.DAT" do
  content lazy { ::File.open("/tmp/CACHE.DAT").read }
  action :create
  notifies :restart, "service[#{node[:jds][:cache_service]}]", :immediately
  notifies :delete, "file[/tmp/CACHE.DAT]", :immediately
  only_if { node[:jds][:build_jds] && File.exists?("/tmp/CACHE.DAT") }
end

# Copy cron job to clear jds journal entries
cookbook_file "clear_jds_journal" do
  path "#{node[:jds][:cron_dir]}/clear_jds_journal"
  action :create
  mode "0644"
end
