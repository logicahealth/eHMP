#
# Cookbook Name:: jboss-eap_wrapper
# Recipe:: default
#

include_recipe "java_wrapper"
include_recipe "java_wrapper::remove_older_jdks"
include_recipe "jboss-eap"

service "stop_jboss" do
	service_name "jboss"
	action :nothing
	subscribes :stop, 'bash[remove_older_jdks]', :before
end