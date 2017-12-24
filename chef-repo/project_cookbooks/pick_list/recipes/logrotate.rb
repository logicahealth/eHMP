#
# Cookbook Name:: pick_list
# Recipe:: logrotate
#

logrotate_app node[:pick_list][:logrotate][:name] do
	path node[:pick_list][:logrotate][:path]
	options node[:pick_list][:logrotate][:options]
	enable true
	rotate node[:pick_list][:logrotate][:rotate]
	frequency node[:pick_list][:logrotate][:frequency]
	dateformat node[:pick_list][:logrotate][:dateformat]
end

logrotate_app node[:pick_list][:logrotate][:incidents][:name] do
	path node[:pick_list][:logrotate][:incidents][:path]
	options node[:pick_list][:logrotate][:incidents][:options]
	enable true
	rotate node[:pick_list][:logrotate][:incidents][:rotate]
	frequency node[:pick_list][:logrotate][:incidents][:frequency]
	dateformat node[:pick_list][:logrotate][:incidents][:dateformat]
end