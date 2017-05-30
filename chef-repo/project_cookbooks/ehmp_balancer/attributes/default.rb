#
# Cookbook Name:: ehmp
# Recipe:: default
#

default[:ehmp_balancer][:fqdn] = "web.vistacore.us"
default[:ehmp_balancer][:incoming_port] = "443"
default[:ehmp_balancer][:add_incoming_port] = false
default[:ehmp_balancer][:environment] = nil
default[:ehmp_balancer][:mix_stack_name] = nil

unless node[:apache].nil?
  default[:ehmp_balancer][:ssl_dir] = "#{node[:apache][:dir]}/ssl"
end
default[:ehmp_balancer][:ssl_cert_chain_file] = "#{node[:ehmp_balancer][:ssl_dir]}/chain.crt"
default[:ehmp_balancer][:ssl_cert_file] = "#{node[:ehmp_balancer][:ssl_dir]}/server.crt"
default[:ehmp_balancer][:ssl_cert_key_file] = "#{node[:ehmp_balancer][:ssl_dir]}/server.key"
default[:ehmp_balancer][:token] = "NSS FIPS 140-2 Certificate DB"
default[:ehmp_balancer][:nss_protocol] = "TLSv1.1,TLSv1.2"
default[:ehmp_balancer][:nss_cipher_suite] = "+rsa_aes_128_sha,+rsa_aes_256_sha"

default[:ehmp_balancer][:lb_method] = "byrequests"
default[:ehmp_balancer][:sticky_session] = "JSESSIONID" # NOTE: Set to 'DISABLED' to turn off sticky-session support
default[:ehmp_balancer][:rdk_timeout] = 480 # 7 minutes rdk timeout + 1 = 8 min
default[:ehmp_balancer][:rdk_cookie] = "ehmp.vistacore.rdk.sid"

default[:ehmp_balancer][:ssoi_deploy] = false
default[:ehmp_balancer][:apache_log_level] = "warn"

default[:ehmp_balancer][:web_agent] = {
  config_dir: "/opt/CA/webagent",
  enable_web_agent: "YES",
  agent_config_object: "eHMPAgentConfigurationObject"
}
