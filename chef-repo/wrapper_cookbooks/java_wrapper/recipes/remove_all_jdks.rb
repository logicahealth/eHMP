#
# Cookbook Name:: java_wrapper
# Recipe:: remove_all_jdks
#

directory '/usr/lib/jvm' do
	recursive true
	action :delete
end