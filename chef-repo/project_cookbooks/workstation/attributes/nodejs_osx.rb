#
# Cookbook Name:: workstation
# Recipe:: nodejs_osx
#

default[:workstation][:nodejs_osx][:version] = "0.10.40"
default[:workstation][:nodejs_osx][:filename] = "node-v#{node[:nodejs][:version]}"
default[:workstation][:nodejs_osx][:path] = "#{Chef::Config[:file_cache_path]}/#{node[:workstation][:nodejs_osx][:filename]}.pkg"
default[:workstation][:nodejs_osx][:source] = "http://nodejs.org/dist/v#{node[:workstation][:nodejs_osx][:version]}/#{node[:workstation][:nodejs_osx][:filename]}.pkg"
default[:workstation][:nodejs_osx][:package] = "org.nodejs.pkg"
