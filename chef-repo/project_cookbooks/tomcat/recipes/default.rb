#
# Cookbook Name:: tomcat
# Recipe:: default
#

include_recipe "tomcat::ark"
include_recipe "java_wrapper::remove_older_jdks"

service "stop_tomcat" do
	service_name "tomcat8"
	action :nothing
	subscribes :stop, 'bash[remove_older_jdks]', :before
end

service "start_tomcat" do
	service_name "tomcat8"
	action :start
end
