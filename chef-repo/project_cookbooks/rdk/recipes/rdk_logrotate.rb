#
# Cookbook Name:: rdk
# Recipe:: logrotate
#

logrotate_app node[:rdk][:logrotate][:name] do
	path node[:rdk][:logrotate][:path]
	options node[:rdk][:logrotate][:options]
	enable true
	rotate node[:rdk][:logrotate][:rotate]
	frequency node[:rdk][:logrotate][:frequency]
	dateformat node[:rdk][:logrotate][:dateformat]
end
