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
default[:asu][:timeout] = 120000

# Tomcat default values. These are the defaults for Tomcat 8 NIO
default[:asu][:tomcat] = {
	:accept_count => 100,
	:max_connections => 10000,
	:max_threads => 200
}
default[:asu][:jds_ip] = nil
default[:asu][:vxsync_ip] = nil
default[:asu][:jds_port] = nil
default[:asu][:jds_app_server_ident] = nil
