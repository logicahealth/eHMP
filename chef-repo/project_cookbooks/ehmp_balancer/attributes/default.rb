#
# Cookbook Name:: ehmp
# Recipe:: default
#

default[:ehmp_balancer][:fqdn] = "web.vistacore.us"
default[:ehmp_balancer][:incoming_port] = "443"
default[:ehmp_balancer][:add_incoming_port] = false
default[:ehmp_balancer][:environment] = nil

unless node[:apache].nil?
  default[:ehmp_balancer][:ssl_dir] = "#{node[:apache][:dir]}/ssl"
end
default[:ehmp_balancer][:ssl_cert_chain_file] = "#{node[:ehmp_balancer][:ssl_dir]}/chain.crt"
default[:ehmp_balancer][:ssl_cert_file] = "#{node[:ehmp_balancer][:ssl_dir]}/server.crt"
default[:ehmp_balancer][:ssl_cert_key_file] = "#{node[:ehmp_balancer][:ssl_dir]}/server.key"
default[:ehmp_balancer][:token] = "NSS FIPS 140-2 Certificate DB"

default[:ehmp_balancer][:lb_method] = "byrequests"
default[:ehmp_balancer][:sticky_session] = "JSESSIONID" # NOTE: Set to 'DISABLED' to turn off sticky-session support
