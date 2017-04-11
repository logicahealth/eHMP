#
# Cookbook Name:: workstation
# Recipe:: default
#


#Load Nexus_url from common cookbook
include_recipe "common::load_nexus_url"
node.default[:nexus_url] = node[:common][:nexus_url]

directory "#{node[:workstation][:user_home]}/Projects/vistacore/private_licenses/bower" do
	recursive true
	owner node[:workstation][:user]
  	# group node[:workstation][:user]
  	mode "0755"
end

directory "#{node[:workstation][:user_home]}/Projects/vistacore/private_licenses/java" do
	recursive true
	owner node[:workstation][:user]
  	mode "0755"
end

directory "#{node[:workstation][:user_home]}/Projects/vistacore/private_licenses/oracle" do
	recursive true
	owner node[:workstation][:user]
  	mode "0755"
end

directory "#{node[:workstation][:user_home]}/Projects/vistacore/private_licenses/cache_server" do
	recursive true
	owner node[:workstation][:user]
  	mode "0755"
end

include_recipe "workstation::#{node['platform_family']}"
