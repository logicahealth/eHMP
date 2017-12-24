#
# Cookbook Name:: cdsinvocation
# Recipe:: nerve
#

include_recipe 'nerve_wrapper'

nerve_wrapper "cdsinvocation" do
	host node[:ipaddress]
	port node[:tomcat][:http_port]
	checks node[:cdsinvocation][:nerve][:checks]
	check_interval node[:cdsinvocation][:nerve][:check_interval]
	service_type "cdsinvocation"
end
