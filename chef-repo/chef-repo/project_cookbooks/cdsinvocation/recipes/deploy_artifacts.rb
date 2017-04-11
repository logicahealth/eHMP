#
# Cookbook Name:: cdsinvocation
# Recipe:: deploy_artifacts
#

directory "/etc/.java/.systemPrefs" do
  owner "root"
  group "root"
  mode "0755"
  recursive true
end


remote_file "#{Chef::Config[:file_cache_path]}/cds-metrics-service.war" do
  source node[:cdsinvocation][:metrics][:source]
  mode "0755"
  use_conditional_get true
end

remote_file "#{Chef::Config[:file_cache_path]}/cds-results-service.war" do
  source node[:cdsinvocation][:results][:source]
  mode "0755"
  use_conditional_get true
end

file "#{node[:tomcat][:webapp_dir]}/cds-metrics-service.war" do
  content lazy { IO.read("#{Chef::Config[:file_cache_path]}/cds-metrics-service.war") }
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
end

file "#{node[:tomcat][:webapp_dir]}/cds-results-service.war" do
  content lazy { IO.read("#{Chef::Config[:file_cache_path]}/cds-results-service.war") }
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
end
