#
# Cookbook Name:: apache2_wrapper
# Attributes:: default
#
#

# Set binary and MPM based on specific type of platform
# Currently we're only interested in overriding for specific platforms. Show warning if something else is discovered
# See apache2 default.rb for corresponding logic to set the defaults
case node['platform']
when 'redhat', 'centos', 'scientific', 'fedora', 'amazon', 'oracle'
  default['apache']['binary'] = '/usr/sbin/httpd.worker'
  default['apache']['mpm'] = 'worker'
else
  Chef::Log.warn "Platform not recognized by apache wrapper: #{node['platform']}. Apache binary set to default for platform: #{node['apache']['binary']}"
end

default['apache']['keepalivetimeout']  = 3

# Default values for worker MPM. The values chosen are optimized for local and AWS,
# where RAM is lower, in order to avoid swapping. In VA environments where more RAM
# is available these values MUST be overridden and tuned based on available memory.
# Average httpd process size should be calculated, then use that to determine maximum
# number of request workers that can fit within available RAM
default['apache']['worker']['startservers']        = 3
default['apache']['worker']['serverlimit']         = 16
default['apache']['worker']['minsparethreads']     = 60
default['apache']['worker']['maxsparethreads']     = 120
default['apache']['worker']['threadlimit']         = 64
default['apache']['worker']['threadsperchild']     = 25
default['apache']['worker']['maxrequestworkers']   = 400
default['apache']['worker']['maxconnectionsperchild'] = 0

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
default[:apache][:serversignature] = 'Off'
