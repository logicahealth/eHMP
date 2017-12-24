#
# Cookbook Name:: vista
# Recipe:: apache2
#
#

def in_ec2?
  node[:cloud] != nil
end

# Ohai Attributes:
# http://docs.opscode.com/ohai_automatic_attributes.html
# https://github.com/opscode/ohai/blob/master/lib/ohai/plugins/cloud.rb
if in_ec2?
  fqdn = node[:cloud][:public_hostname]
else
  fqdn = 'localhost'
end

directory node[:apache][:ssl_dir] do
  owner node[:apache][:user]
  group node[:apache][:group]
  recursive true
  action :create
end

execute "create-private-key" do
  command "openssl genrsa > #{node[:apache][:ssl_cert_key_file]}"
  not_if "test -f #{node[:apache][:ssl_cert_key_file]}"
end

execute "create-certificate" do
  command "openssl req -new -x509 -key #{node[:apache][:ssl_cert_key_file]} -out #{node[:apache][:ssl_cert_file]} -days 1 <<EOF
US
VA
Chantilly
Agilex
Healthcare
#{fqdn}
jay.flowers@agilex.com
EOF"
  not_if "test -f #{node[:apache][:ssl_cert_file]}"
end

fmql_credentials = Chef::EncryptedDataBagItem.load("credentials", "vista_fmql_credentials", node[:data_bag_string])

web_app "fmql" do
  template "fmql.conf.erb"
  server_name fqdn
  rpc_broker "VistA"
  rpc_host fqdn
  rpc_port node[:vista][:rpc_port]
  access_code fmql_credentials["access_code"]
  verify_code fmql_credentials["verify_code"]
  document_root "/usr/local/fmql"
  error_log "/etc/httpd/logs/error_fmql.log"
  ssl_cert_file node[:apache][:ssl_cert_file]
  ssl_cert_key_file node[:apache][:ssl_cert_key_file]
end
