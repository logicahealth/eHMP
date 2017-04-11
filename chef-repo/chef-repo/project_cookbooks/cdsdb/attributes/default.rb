#
# Cookbook Name:: cdsdb
#

default[:cdsdb][:ssl_files][:data_bags][:ssl_key_pem] = nil
default[:cdsdb][:ssl_files][:data_bags][:public_ca_db] = "root_ca"
default[:cdsdb][:ssl_dir] = "/etc/ssl/certs"
default[:cdsdb][:ssl_pem_key_file] = "#{node[:cdsdb][:ssl_dir]}/server.pem"
default[:cdsdb][:ssl_ca_file] = "#{node[:cdsdb][:ssl_dir]}/rootCA.crt"

default['mongodb']['port'] = 54321
default['mongodb']['config']['port'] = node['mongodb']['port']
default['mongodb']['config']['diaglog'] = 0
default['mongodb']['config']['auth'] = true
default['mongodb']['config']['noscripting'] = true
default['mongodb']['config']['sslMode'] = "requireSSL"
default['mongodb']['config']['sslPEMKeyFile'] = node[:cdsdb][:ssl_pem_key_file]
default['mongodb']['config']['sslCAFile'] = node[:cdsdb][:ssl_ca_file]
default['mongodb']['config']['sslAllowConnectionsWithoutCertificates'] = true

# Logging
default[:cdsdb][:logrotate][:name] = 'mongodb_logs'
default[:cdsdb][:logrotate][:path] = "#{node['mongodb']['config']['logpath']}"
default[:cdsdb][:logrotate][:rotate] = 7
default[:cdsdb][:logrotate][:options] = %w{missingok compress delaycompress copytruncate notifempty dateext}
default[:cdsdb][:logrotate][:frequency] = 'daily'
default[:cdsdb][:logrotate][:dateformat] = '-%Y%m%d%s'