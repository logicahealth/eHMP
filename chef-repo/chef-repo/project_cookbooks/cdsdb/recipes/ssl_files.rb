#
# Cookbook Name:: cdsdb
# Recipe:: ssl_files
#

file "/etc/ssl/certs/rootCA.crt" do
	action :create
	content lazy {
		Chef::EncryptedDataBagItem.load("mongo", node[:cdsdb][:ssl_files][:data_bags][:public_ca_db], node[:data_bag_string])["content"].join("\n")
	}
	mode '0444'
	owner 'root'
	notifies :restart, "service[#{node[:mongodb][:default_init_name]}]", :delayed
end

file "/etc/ssl/certs/server.pem" do
	action :create
	content lazy { 
		Chef::EncryptedDataBagItem.load("mongo", node[:cdsdb][:ssl_files][:data_bags][:ssl_key_pem], node[:data_bag_string])["content"].join("\n") 
	}
	mode '0444'
	owner 'root'
	notifies :restart, "service[#{node[:mongodb][:default_init_name]}]", :delayed
	not_if { node[:cdsdb][:ssl_files][:data_bags][:ssl_key_pem].nil? }
end

cdsdb_generate_dev_ssl "generate_ssl_file_for_local_and_aws_deploys" do
	action :generate
	notifies :restart, "service[#{node[:mongodb][:default_init_name]}]", :delayed
	only_if { node[:cdsdb][:ssl_files][:data_bags][:ssl_key_pem].nil? }
end