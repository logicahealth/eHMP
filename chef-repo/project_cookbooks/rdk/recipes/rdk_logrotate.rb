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

logrotate_app node[:rdk][:logrotate][:incidents][:name] do
	path node[:rdk][:logrotate][:incidents][:path]
	options node[:rdk][:logrotate][:incidents][:options]
	enable true
	rotate node[:rdk][:logrotate][:incidents][:rotate]
	frequency node[:rdk][:logrotate][:incidents][:frequency]
	dateformat node[:rdk][:logrotate][:incidents][:dateformat]
end
