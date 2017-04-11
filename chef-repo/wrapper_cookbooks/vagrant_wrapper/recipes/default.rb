#
# Cookbook Name:: vagrant_wrapper
# Recipe:: default
#

node.normal[:vagrant][:version]     = '1.4.3'
node.normal[:vagrant][:url]         = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/program/vagrant/vagrant/#{node[:vagrant][:version]}/vagrant-#{node[:vagrant][:version]}.dmg"
node.normal[:vagrant][:checksum]    = "e7ff13b01d3766829f3a0c325c1973d15b589fe1a892cf7f857da283a2cbaed1"

include_recipe "vagrant"
