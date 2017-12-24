#
# Cookbook Name:: activity_handler
# Recipe:: logrotate
#

logrotate_app node[:activity_handler][:logrotate][:name] do
	path node[:activity_handler][:logrotate][:path]
	options node[:activity_handler][:logrotate][:options]
	enable true
	rotate node[:activity_handler][:logrotate][:rotate]
	frequency node[:activity_handler][:logrotate][:frequency]
	dateformat node[:activity_handler][:logrotate][:dateformat]
end

logrotate_app node[:activity_handler][:logrotate][:incidents][:name] do
	path node[:activity_handler][:logrotate][:incidents][:path]
	options node[:activity_handler][:logrotate][:incidents][:options]
	enable true
	rotate node[:activity_handler][:logrotate][:incidents][:rotate]
	frequency node[:activity_handler][:logrotate][:incidents][:frequency]
	dateformat node[:activity_handler][:logrotate][:incidents][:dateformat]
end