#
# Cookbook Name:: jds
# Recipe:: create_namespace
#
user_password = Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"]

cookbook_file "vprnamespace.mac" do
  path "#{Chef::Config[:file_cache_path]}/vprnamespace.mac"
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  mode "0755"
  action :create
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
