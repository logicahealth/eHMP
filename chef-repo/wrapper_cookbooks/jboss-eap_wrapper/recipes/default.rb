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

# Set git and maven repo locations
jboss_java_option "set git directory" do
    option "-Dorg.uberfire.nio.git.dir=#{node['jboss-eap']['home_dir']} -Dorg.uberfire.metadata.index.dir=#{node['jboss-eap']['home_dir']} -Dorg.guvnor.m2repo.dir=#{node['jboss-eap']['home_dir']}/repository -Dkie.maven.settings.custom=#{node['jboss-eap']['home_dir']}/.m2/settings.xml"
end

service "start_jboss" do
	service_name "jboss"
	action :nothing
	subscribes :start, 'bash[remove_older_jdks]', :immediately
end
