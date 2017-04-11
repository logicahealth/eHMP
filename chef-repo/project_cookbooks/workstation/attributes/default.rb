#
# Cookbook Name:: workstation
# Recipe:: default
#

default[:workstation][:user] = ENV["SUDO_USER"] || nil
default[:workstation][:user_home] = ENV["HOME"]

default[:workstation][:osx_gem_dir] = "#{node[:workstation][:user_home]}/Projects/vistacore/.aidk_gems"
default[:workstation][:rhel_gem_dir] = "#{node[:workstation][:user_home]}/Projects/vistacore/.gems"

default[:workstation][:private_licenses] = "#{node[:workstation][:user_home]}/Projects/vistacore/private_licenses"

default[:nexus_url] = nil
