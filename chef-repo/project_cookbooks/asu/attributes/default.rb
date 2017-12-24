#
# Cookbook Name:: asu
# Recipe:: default
#

default[:asu][:source] = nil # options the uri should be either https://some.thing.com/stuff... or file:///path/to/artifact.ext
default[:asu][:filename] = "asu"
default[:asu][:artifact_path] = "#{Chef::Config['file_cache_path']}/#{node[:asu][:filename]}.zip"
default[:asu][:checksum] = nil
default[:asu][:service] = "asu_server"
default[:asu][:home_dir] = "/opt/#{node[:asu][:service]}"
default[:asu][:config_dir] = "#{node[:asu][:home_dir]}/config"
default[:asu][:log_dir] = "/var/log/#{node[:asu][:filename]}"
default[:asu][:pid_dir] = "/var/run/#{node[:asu][:filename]}"
default[:asu][:base_dir] = "/var/tmp/#{node[:asu][:filename]}"
default[:asu][:server_port] = 9000
default[:asu][:management_port] = 8081
default[:asu][:refresh_interval] = 60000
default[:asu][:log_level] = "INFO"

# Logrotate configuration
default[:asu][:logrotate][:name] = 'asu_logs'
default[:asu][:logrotate][:log_directory] = "#{node[:asu][:log_dir]}/*.log"
default[:asu][:logrotate][:rotate] = 10
default[:asu][:logrotate][:options] = %w{missingok compress delaycompress copytruncate notifempty dateext}
default[:asu][:logrotate][:frequency] = 'daily'
default[:asu][:logrotate][:dateformat] = '-%Y%m%d%s'

# Tomcat default values. These are the defaults for Tomcat 8 NIO
default[:asu][:tomcat] = {
	:accept_count => 100,
	:max_connections => 10000,
	:max_threads => 200
}
default[:asu][:jds_ip] = nil
default[:asu][:vxsync_ip] = nil
default[:asu][:jds_port] = nil
default[:asu][:jds_app_server_assignment] = nil

default['asu']['user'] = 'asu'
default['asu']['group'] = 'asu'

default[:asu][:nerve] = {
  :check_interval => 30,
  :checks => [
		{
			type: "http",
			port: node[:asu][:management_port],
			uri: "/health",
			expect: '{"status":"UP"}',
			timeout: 5,
			rise: 3,
			fall: 2
		}
	]
}
