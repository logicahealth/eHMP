#
# Cookbook Name:: cdsdashboard
# Recipe:: apache2
#

include_recipe "apache2_wrapper"

fqdn = node[:cdsdashboard][:fqdn]

node.normal[:apache][:listen_ports] = node[:apache][:listen_ports] + [node[:cdsdashboard][:apache2_config][:port]] unless node[:apache][:listen_ports].include?(node[:cdsdashboard][:apache2_config][:port])

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

trigger_resources = []

if !certs.nil?
  puts "certs were retrieved... creating/appending certificate files"
  %w(ssl_cert_file ssl_cert_key_file ssl_cert_chain_file).each do |cert_name|
    trigger_resources << file(node['apache'][cert_name]) do
      action :create
      content certs[cert_name].join("\n")
      notifies :restart, "service[apache2]"
    end
  end
else
  trigger_resources << execute("create-private-key") do
    command "openssl genrsa > #{node['apache']['ssl_cert_key_file']}"
    not_if "test -f #{node['apache']['ssl_cert_key_file']}"
  end

  trigger_resources << execute("create-certficate") do
    command "openssl req -new -x509 -key #{node['apache']['ssl_cert_key_file']} -out #{node['apache']['ssl_cert_file']} -days 365 <<EOF
US
VA
Chantilly
Agilex
Healthcare
#{fqdn}
team-milkyway@vistacore.us
EOF"
    only_if { IO.popen("openssl x509 -text -in #{node['apache']['ssl_cert_file']}").grep(/#{fqdn}/).size == 0 }
  end
end

web_app "cdsdashboard" do
  template "cdsdashboard.conf.erb"
  server_name fqdn
  port node[:cdsdashboard][:apache2_config][:port]
  document_root node['apache']['root_dir']
  ssl_cert_file node['apache']['ssl_cert_file']
  ssl_cert_key_file node['apache']['ssl_cert_key_file']
  ssl_cert_chain_file node['apache']['ssl_cert_chain_file'] if node['apache'].key?('ssl_cert_chain_file')
end

service "Restart on SSL key issue" do
  service_name 'httpd'
  action :restart
  only_if { trigger_resources.any? { |trigger_resource| trigger_resource.updated_by_last_action? } }
end
