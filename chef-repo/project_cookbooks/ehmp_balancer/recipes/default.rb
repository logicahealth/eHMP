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

# create configuration file that has proxy/balancer in /etc/httpd/sites-available
template "#{node[:apache][:dir]}/sites-available/proxy_balancer.conf" do
  source "proxy_balancer.conf.erb"
  mode   '600'
  owner node[:apache][:user]
  group node[:apache][:group]
  variables(
    lazy {
      {
        :ehmp_ui_members => find_multiple_nodes_by_role("ehmp-ui", node[:stack]),
        :rdk_members => find_multiple_nodes_by_role("resource_server", node[:stack])
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
  certs = Chef::EncryptedDataBagItem.load("certs", cert_data_bag_item_name, 'n25q2mp#h4')
  Chef::Log.debug  "#{cert_data_bag_item_name} data bag found"
rescue
  Chef::Log.warn "Did not find data bag item 'certs' #{cert_data_bag_item_name}, this could be okay, we will proceed to make a self-singed cert instead."
end

if certs.nil?
  Chef::Log.warn "Searching for wildcard cert..."
  begin
    # certificate chain file
    certs = Chef::EncryptedDataBagItem.load("certs", "wildcard", 'n25q2mp#h4')
    Chef::Log.warn "wildcard cert found"
  rescue
    Chef::Log.warn "Did not find data bag item 'certs' 'wildcard', this could be okay, we will proceed to for a server specific cert instead."
  end
end

if certs.nil?
  puts "*** create temporary certs"
  puts "***     private key"
  execute "create-private-key" do
    command "openssl genrsa > #{node[:ehmp_balancer][:ssl_cert_key_file]}"
    not_if "test -f #{node[:ehmp_balancer][:ssl_cert_key_file]}"
  end

  puts "***     certificate"
  execute "create-certificate" do
    command "openssl req -new -x509 -key #{node[:ehmp_balancer][:ssl_cert_key_file]} -out #{node[:ehmp_balancer][:ssl_cert_file]} -days 365 <<EOF
US
VA
Chantilly
Agilex
Healthcare
#{node[:ehmp_balancer][:fqdn]}
jay.flowers@agilex.com
EOF"
    only_if { IO.popen("openssl x509 -text -in #{node[:ehmp_balancer][:ssl_cert_file]}").grep(/#{fqdn}/).size == 0 }
  end
else
  puts "certs were retrieved... creating/appending certificate files"
  %w(ssl_cert_file ssl_cert_key_file ssl_cert_chain_file).each do |cert_name|
    puts "cert_name:  #{cert_name}"
    puts "data: #{certs[cert_name]}"

    file node[:ehmp_balancer][cert_name] do
      action :create
      content Array(certs[cert_name]).join("\n")
      notifies :restart, "service[apache2]"
    end
  end
end

# Export server certificate file to pkcs12 formatted file
p "/usr/bin/openssl pkcs12 -export -in #{node[:ehmp_balancer][:ssl_cert_file]} -inkey #{node[:ehmp_balancer][:ssl_cert_key_file]} -out #{node[:ehmp_balancer][:ssl_cert_file]}.p12 -name Server-Cert"
execute "convert-key" do
  command "/usr/bin/openssl pkcs12 -export -in #{node[:ehmp_balancer][:ssl_cert_file]} -inkey #{node[:ehmp_balancer][:ssl_cert_key_file]} -out #{node[:ehmp_balancer][:ssl_cert_file]}.p12 -name 'Server-Cert' -password pass:" 
end

nss_keystore_password = Chef::EncryptedDataBagItem.load("credentials", "ehmp_balancer_nss_keystore_password", 'n25q2mp#h4')["password"]

# Create a temporary password file for use by the certificate keystore utilities
p "tmp pw file:  #{node[:ehmp_balancer][:ssl_dir]}/password-file"
template "#{node[:ehmp_balancer][:ssl_dir]}/password-file" do
  source "password-file.erb"
  owner node[:apache][:user]
  group node[:apache][:group]
  mode   '600'
  variables(:nss_keystore_password => nss_keystore_password)
  action :create
end

# Create a working script file to create and load the keystore database
p "generate keystore script:  #{node[:ehmp_balancer][:ssl_dir]}/keystore.sh"
template "#{node[:ehmp_balancer][:ssl_dir]}/keystore.sh" do
  source "keystore.sh.erb"
  owner node[:apache][:user]
  group node[:apache][:group]
  mode   '700'
  action :create
end

# Create the certificate database, enable FIPS and load the certificates
p "create and load keystore"
execute "create-keystore" do
  command "#{node[:ehmp_balancer][:ssl_dir]}/keystore.sh"
  not_if { File.exists?("#{node[:ehmp_balancer][:ssl_dir]}/cert8.db") }
end

# The following should probably go in a data bag:  FIPS passphrase file
p "pw conf:  #{node[:ehmp_balancer][:ssl_dir]}/password.conf"
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
p "set proper permissions"
execute "set-perms" do
  command "/bin/chmod 600 #{node[:ehmp_balancer][:ssl_dir]}/*"
  command "/bin/chown #{node[:apache][:user]}:#{node[:apache][:group]} #{node[:ehmp_balancer][:ssl_dir]}/*"
end 
