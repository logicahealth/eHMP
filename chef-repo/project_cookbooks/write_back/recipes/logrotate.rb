#
# Cookbook Name:: write_back
# Recipe:: logrotate
#

logrotate_app node[:write_back][:logrotate][:name] do
	path node[:write_back][:logrotate][:path]
	options node[:write_back][:logrotate][:options]
	enable true
	rotate node[:write_back][:logrotate][:rotate]
	frequency node[:write_back][:logrotate][:frequency]
	dateformat node[:write_back][:logrotate][:dateformat]
end

logrotate_app node[:write_back][:logrotate][:incidents][:name] do
	path node[:write_back][:logrotate][:incidents][:path]
	options node[:write_back][:logrotate][:incidents][:options]
	enable true
	rotate node[:write_back][:logrotate][:incidents][:rotate]
	frequency node[:write_back][:logrotate][:incidents][:frequency]
	dateformat node[:write_back][:logrotate][:incidents][:dateformat]
end