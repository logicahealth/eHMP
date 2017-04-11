#
# Cookbook Name:: vxsync
# Recipe:: default
#

default[:asu][:source] = nil # options the uri should be either https://some.thing.com/stuff... or file:///path/to/artifact.ext
default[:asu][:filename] = 'asu'
default[:asu][:artifact_path] = "#{Chef::Config['file_cache_path']}/#{node[:asu][:filename]}.zip"
default[:asu][:checksum] = nil
default[:asu][:service] = 'asu_server'
default[:asu][:home_dir] = "/opt/#{node[:asu][:service]}"
default[:asu][:log_dir] = "#{node[:asu][:home_dir]}/logs"
default[:asu][:config_dir] = "#{node[:asu][:home_dir]}/config"
default[:asu][:server_port] = 9000
default[:asu][:refresh_interval] = 60000
default[:asu][:timeout] = 30000
default[:asu][:jds_ip] = nil
default[:asu][:vxsync_ip] = nil
default[:asu][:jds_port] = nil
