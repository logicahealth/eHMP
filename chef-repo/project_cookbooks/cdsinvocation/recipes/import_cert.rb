#
# Cookbook Name:: cdsinvocation
# Recipe:: import_cert
#

common_directory "#{node[:tomcat][:home]}/shared/classes/certs" do
  recursive true
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
end

file "#{node[:cdsinvocation][:import_cert][:trust_store]}" do
  action :nothing
end

file("/tmp/ssl_ca.crt") do
  action :create
  content lazy { 
    Chef::EncryptedDataBagItem.load("mongo", node[:cdsinvocation][:ssl_files][:data_bags][:public_ca_db], node[:data_bag_string])["content"].join("\n")
  }
  mode '0444'
  owner 'root'
  notifies :delete, "file[#{node[:cdsinvocation][:import_cert][:trust_store]}]", :immediately
end

keytool_manage 'create_trust_store' do
  cert_alias node[:cdsinvocation][:import_cert][:alias]
  file '/tmp/ssl_ca.crt'
  keystore node[:cdsinvocation][:import_cert][:trust_store]
  storepass lazy {
    Chef::EncryptedDataBagItem.load("mongo", node[:cdsinvocation][:import_cert][:store_pass_db], node[:data_bag_string])["store_pass"]
  }
  additional '-v'
  action :importcert
  notifies :restart, "service[#{node[:tomcat][:service]}]", :immediately
end
