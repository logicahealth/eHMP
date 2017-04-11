#
# Cookbook Name:: rdk
# Recipe:: logrotate
#

logrotate_app "rdk_logs" do
	path "#{node[:rdk][:log_dir]}/*.log"
	enable true
	rotate "10"
	frequency "daily"
	dateformat "%Y-%m-%d-%s"
end
