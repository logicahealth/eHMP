#
# Cookbook Name:: fetch_server
# Recipe:: config
#

ca_cert = Chef::EncryptedDataBagItem.load("mongo", node[:fetch_server][:ssl_files][:data_bags][:public_ca_db], node[:data_bag_string])
file "#{node[:fetch_server][:home_dir]}/config/#{node[:fetch_server][:sslCACertName]}" do
  action :create
  content ca_cert["content"].join("\n")
  mode '0444'
  owner node[:fetch_server][:user]
  group node[:fetch_server][:group]
  notifies :restart, "service[#{node[:fetch_server][:service_config][:name]}]"
end
