#
# Cookbook Name:: rdk
# Recipe:: config
#

ca_cert = Chef::EncryptedDataBagItem.load("mongo", node[:rdk][:ssl_files][:data_bags][:public_ca_db], node[:data_bag_string])
file "#{node[:rdk][:home_dir]}/config/#{node[:rdk][:sslCACertName]}" do
  action :create
  content ca_cert["content"].join("\n")
  mode '0444'
  owner 'root'
  notifies :restart, "service[#{node[:rdk][:services][:fetch_server][:service]}]"
end
