#
# Cookbook Name:: fetch_server
# Recipe:: logrotate
#

logrotate_app node[:fetch_server][:logrotate][:name] do
	path node[:fetch_server][:logrotate][:path]
	options node[:fetch_server][:logrotate][:options]
	enable true
	rotate node[:fetch_server][:logrotate][:rotate]
	frequency node[:fetch_server][:logrotate][:frequency]
	dateformat node[:fetch_server][:logrotate][:dateformat]
end

logrotate_app node[:fetch_server][:logrotate][:incidents][:name] do
	path node[:fetch_server][:logrotate][:incidents][:path]
	options node[:fetch_server][:logrotate][:incidents][:options]
	enable true
	rotate node[:fetch_server][:logrotate][:incidents][:rotate]
	frequency node[:fetch_server][:logrotate][:incidents][:frequency]
	dateformat node[:fetch_server][:logrotate][:incidents][:dateformat]
end