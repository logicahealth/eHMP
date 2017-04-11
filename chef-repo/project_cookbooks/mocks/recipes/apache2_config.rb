#
# Cookbook Name:: mocks
# Recipe:: apache2_config
#

include_recipe "apache2_wrapper"

fqdn = node[:mocks][:fqdn]

node.normal[:apache] = {
  "default_site_enabled" => true,
  "package" => "httpd",
  "listen_ports" => [
    "443"
  ]
}

#node.include_attribute(:apache2)

include_recipe "apache2"
include_recipe "apache2::mod_ssl"
include_recipe "apache2::mod_headers"
include_recipe "apache2::mod_proxy"
include_recipe "apache2::mod_proxy_http"


directory node[:apache][:ssl_dir] do
  owner node[:apache][:user]
  group node[:apache][:group]
  recursive true
  action :create
end

certs = nil

ssl_file_resources = []

if certs.nil?
  Chef::Log.debug "Searching for wildcard cert..."

  begin
    certs = Chef::EncryptedDataBagItem.load("certs", "wildcard", 'n25q2mp#h4')
    node.default[:apache][:ssl_cert_chain_file] = '/etc/httpd/ssl/chain.crt'
    Chef::Log.debug "wildcard cert found"
  rescue
    Chef::Log.warn "Did not find data bag item 'certs' 'wildcard', this could be okay, we will proceed to for a server specific cert instead."
  end

end

ssl_file_resources = []

if !certs.nil?
  puts "certs were retrieved... creating/appending certificate files"
  %w(ssl_cert_file ssl_cert_key_file ssl_cert_chain_file).each do |cert_name|
    ssl_file_resources << file(node['apache'][cert_name]) do
      action :create
      content certs[cert_name].join("\n")
      notifies :restart, "service[apache2]"
    end
  end
else
  ssl_file_resources << execute("create-private-key") do
    command "openssl genrsa > #{node['apache']['ssl_cert_key_file']}"
    not_if "test -f #{node['apache']['ssl_cert_key_file']}"
  end

  ssl_file_resources << execute("create-certficate") do
    command "openssl req -new -x509 -key #{node['apache']['ssl_cert_key_file']} -out #{node['apache']['ssl_cert_file']} -days 365 <<EOF
US
Virginia
Chantilly
Vistacore
Vistacore
#{fqdn}
vistacore@vistacore.us
EOF"
    only_if { IO.popen("openssl x509 -text -in #{node['apache']['ssl_cert_file']}").grep(/#{fqdn}/).size == 0 }
  end
end

web_app "mock.node.proxy" do
  template "mock.reverse.conf.erb"
  server_name fqdn
  proxy_target "http://localhost:#{node[:mocks][:ajp][:port]}/"
  ssl_cert_file node[:apache][:ssl_cert_file]
  ssl_cert_key_file node[:apache][:ssl_cert_key_file]
  ssl_cert_chain_file node[:apache][:ssl_cert_chain_file] if node[:apache].has_key?('ssl_cert_chain_file')
end

service "Restart on SSL key issue" do
  service_name 'httpd'
  action :restart
  only_if { ssl_file_resources.any? { |ssl_key_resource| ssl_key_resource.updated_by_last_action? } }
end
