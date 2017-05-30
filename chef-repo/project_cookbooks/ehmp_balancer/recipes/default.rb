#
# Cookbook Name:: lbalancer
# Recipe:: default
#

include_recipe "apache2_wrapper"

# Fix for https://bugzilla.redhat.com/show_bug.cgi?id=1182337
yum_package "nss-softokn-freebl >= 3.14.3-19.el6_6"

directory node[:ehmp_balancer][:ssl_dir] do
  recursive true
end.run_action(:delete)

# Install mod_nss
yum_package "mod_nss"

include_recipe "apache2"

edit_resource!(:template, 'apache2.conf') do
  source 'apache2.conf.erb'
  cookbook 'ehmp_balancer'
  variables.update(
    :web_agent_config_dir => node[:ehmp_balancer][:web_agent][:config_dir],
    :ssoi_deploy => node[:ehmp_balancer][:ssoi_deploy],
    :log_level => node[:ehmp_balancer][:apache_log_level]
  )
end

include_recipe "apache2::mod_headers"
include_recipe "apache2::mod_proxy"
include_recipe "apache2::mod_proxy_http"
include_recipe "apache2::mod_proxy_balancer"

# create configuration file that has nss.conf in /etc/httpd/mods-available
template "#{node[:apache][:dir]}/mods-available/nss.conf" do
  source "nss.conf.erb"
  mode   '400'
  owner node[:apache][:user]
  group node[:apache][:group]
  action :create
end

# create link within /etc/httpd/mods-enabled
link "#{node[:apache][:dir]}/mods-enabled/nss.conf" do
  to "#{node[:apache][:dir]}/mods-available/nss.conf"
  action :create
end

cookbook_file '/var/www/maintenance.html' do
  owner 'root'
  group 'root'
  mode 0755
end

ehmp_ui = find_multiple_nodes_by_role("ehmp-ui", node[:stack])
rdk = find_multiple_nodes_by_role("resource_server", node[:stack])

unless node[:ehmp_balancer][:mix_stack_name].nil? then
  ehmp_ui_r1_2 = find_multiple_nodes_by_role("ehmp-ui", node[:ehmp_balancer][:mix_stack_name])
  rdk_r1_2 = find_multiple_nodes_by_role("resource_server", node[:ehmp_balancer][:mix_stack_name])
else
  ehmp_ui_r1_2 = []
  rdk_r1_2 = []
end

# create configuration file that has proxy/balancer in /etc/httpd/sites-available
template "#{node[:apache][:dir]}/sites-available/proxy_balancer.conf" do
  source "proxy_balancer.conf.erb"
  mode   '600'
  owner node[:apache][:user]
  group node[:apache][:group]
  variables(
    lazy {
      {
        :mixed_environment => (not node[:ehmp_balancer][:mix_stack_name].nil?),
        :server_name => node[:ehmp_balancer][:fqdn],
        :server_port => node[:ehmp_balancer][:incoming_port],
        :lb_method => node[:ehmp_balancer][:lb_method],
        :sticky_session => node[:ehmp_balancer][:sticky_session],
        :rdk_timeout => node[:ehmp_balancer][:rdk_timeout],
        :nss_protocol => node[:ehmp_balancer][:nss_protocol],
        :nss_cipher_suite => node[:ehmp_balancer][:nss_cipher_suite],
        :ehmp_ui_members_r1_2 => ehmp_ui_r1_2,
        :rdk_members_r1_2 => rdk_r1_2,
        :ehmp_ui_members => ehmp_ui,
        :rdk_members => rdk
      }
    }
  )
  action :create
  notifies :restart, "service[apache2]"
end

# create link within /etc/httpd/sites-enabled
link "#{node[:apache][:dir]}/sites-enabled/proxy_balancer.conf" do
  to "#{node[:apache][:dir]}/sites-available/proxy_balancer.conf"
  action :create
end

# remove the /etc/httpd/sites-available/000-defaults link if it exists
link "#{node[:apache][:dir]}/sites-enabled/000-default" do
  action :delete
end

# remove the /etc/httpd/conf.d/nss.conf default file
file "#{node[:apache][:dir]}/conf.d/nss.conf" do
  action :delete
end

# create dir to hold SSL certificate database
directory node[:ehmp_balancer][:ssl_dir] do
  owner node[:apache][:user]
  group node[:apache][:group]
  recursive true
  action :create
end

#
# add or generate ssl cert files
#

fqdn = node[:ehmp_balancer][:fqdn]

certs = nil
begin
  cert_data_bag_item_name = fqdn.gsub(/\.+/, '')
  certs = Chef::EncryptedDataBagItem.load("certs", cert_data_bag_item_name, node[:data_bag_string])
rescue
  Chef::Log.warn "Did not find data bag item 'certs' #{cert_data_bag_item_name}, this could be okay, we will proceed to make a self-singed cert instead."
end

if certs.nil?
  begin
    # certificate chain file
    certs = Chef::EncryptedDataBagItem.load("certs", "wildcard", node[:data_bag_string])
  rescue
    Chef::Log.warn "Did not find data bag item 'certs' 'wildcard', this could be okay, we will proceed to for a server specific cert instead."
  end
end

if certs.nil?
  execute "create-private-key" do
    command "openssl genrsa > #{node[:ehmp_balancer][:ssl_cert_key_file]}"
    not_if "test -f #{node[:ehmp_balancer][:ssl_cert_key_file]}"
  end

  execute "create-certificate" do
    command "openssl req -new -x509 -key #{node[:ehmp_balancer][:ssl_cert_key_file]} -out #{node[:ehmp_balancer][:ssl_cert_file]} -days 365 <<EOF
US
VA
Chantilly
Vistacore
Healthcare
#{node[:ehmp_balancer][:fqdn]}
vistacore@vistacore.us
EOF"
    only_if { IO.popen("openssl x509 -text -in #{node[:ehmp_balancer][:ssl_cert_file]}").grep(/#{fqdn}/).size == 0 }
  end
else
  %w(ssl_cert_file ssl_cert_key_file ssl_cert_chain_file).each do |cert_name|
    file node[:ehmp_balancer][cert_name] do
      action :create
      content Array(certs[cert_name]).join("\n")
      notifies :restart, "service[apache2]"
    end
  end
end

# Export server certificate file to pkcs12 formatted file
execute "convert-key" do
  command "/usr/bin/openssl pkcs12 -export -in #{node[:ehmp_balancer][:ssl_cert_file]} -inkey #{node[:ehmp_balancer][:ssl_cert_key_file]} -out #{node[:ehmp_balancer][:ssl_cert_file]}.p12 -name 'Server-Cert' -password pass:"
end

nss_keystore_password = Chef::EncryptedDataBagItem.load("credentials", "ehmp_balancer_nss_keystore_password", node[:data_bag_string])["password"]

# Create a temporary password file for use by the certificate keystore utilities
template "#{node[:ehmp_balancer][:ssl_dir]}/password-file" do
  source "password-file.erb"
  owner node[:apache][:user]
  group node[:apache][:group]
  mode   '600'
  variables(:nss_keystore_password => nss_keystore_password)
  action :create
end

# Create a working script file to create and load the keystore database
template "#{node[:ehmp_balancer][:ssl_dir]}/keystore.sh" do
  source "keystore.sh.erb"
  owner node[:apache][:user]
  group node[:apache][:group]
  mode   '700'
  action :create
end

# Create the certificate database, enable FIPS and load the certificates
execute "create-keystore" do
  command "#{node[:ehmp_balancer][:ssl_dir]}/keystore.sh"
  not_if { File.exists?("#{node[:ehmp_balancer][:ssl_dir]}/cert8.db") }
end

# The following should probably go in a data bag:  FIPS passphrase file
template "#{node[:ehmp_balancer][:ssl_dir]}/password.conf" do
  source "password.conf.erb"
  owner node[:apache][:user]
  group node[:apache][:group]
  mode   '400'
  variables(:nss_keystore_password => nss_keystore_password)
  action :create
end

# remove the temporary password file
file "#{node[:ehmp_balancer][:ssl_dir]}/password-file" do
  action :delete
end

# remove the temporary keystore script
file "#{node[:ehmp_balancer][:ssl_dir]}/keystore.sh" do
  action :delete
end

# Set proper permissons on certificates and keystore files
# Can this be replaced with a file or directory resource?
execute "set-perms" do
  command "/bin/chmod 600 #{node[:ehmp_balancer][:ssl_dir]}/*"
  command "/bin/chown #{node[:apache][:user]}:#{node[:apache][:group]} #{node[:ehmp_balancer][:ssl_dir]}/*"
end

template "#{node[:apache][:conf_dir]}/WebAgent.conf" do
  source 'WebAgent.conf.erb'
  variables(
    :enable_web_agent => node[:ehmp_balancer][:web_agent][:enable_web_agent],
    :web_agent_config_dir => node[:ehmp_balancer][:web_agent][:config_dir],
    :agent_config_object => node[:ehmp_balancer][:web_agent][:agent_config_object],
    :server_path => node[:apache][:conf_dir]
  )
  owner 'root'
  group 'root'
  mode 0644
  only_if { node[:ehmp_balancer][:ssoi_deploy] }
  notifies :restart, "service[apache2]", :delayed
end
