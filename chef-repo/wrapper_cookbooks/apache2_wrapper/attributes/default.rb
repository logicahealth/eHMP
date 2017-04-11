#
# Cookbook Name:: apache2_wrapper
# Attributes:: default
#
#

default[:apache][:ssl_dir] = '/etc/httpd/ssl'
default[:apache][:ssl_cert_file] = "#{node[:apache][:ssl_dir]}/server.crt"
default[:apache][:ssl_cert_key_file] = "#{node[:apache][:ssl_dir]}/server.key"
default[:apache][:root_dir] = '/var/www'

default[:apache][:default_modules] = [
  "status",
  "alias",
  "auth_basic",
  "authn_core",
  "authn_file",
  "authz_core",
  "authz_groupfile",
  "authz_host",
  "authz_user",
  "dir",
  "env",
  "mime",
  "negotiation",
  "setenvif",
  "log_config",
  "logio"
]
