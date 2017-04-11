#
# Cookbook Name:: tomcat
# Recipe:: logrotate
#


logrotate_app node[:tomcat][:logrotate][:name] do
	path node[:cdsdb][:logrotate][:path]
	options node[:cdsdb][:logrotate][:options]
	enable true
	rotate node[:cdsdb][:logrotate][:rotate]
	frequency node[:cdsdb][:logrotate][:frequency]
	dateformat node[:cdsdb][:logrotate][:dateformat]
end
