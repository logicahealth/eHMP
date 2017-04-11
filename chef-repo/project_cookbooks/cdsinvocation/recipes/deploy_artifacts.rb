#
# Cookbook Name:: cdsinvocation
# Recipe:: deploy_artifacts
#

directory "/etc/.java/.systemPrefs" do
  owner "root"
  group "root"
  mode "0755"
  recursive true
  notifies :restart, "service[#{node[:tomcat][:service]}]", :immediately
end

file "/etc/.java/.systemPrefs/.system.lock" do
  path lazy { "/etc/.java/.systemPrefs/.system.lock" }
  owner "root"
  group "root"
  mode "544"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :immediately
end

file "/etc/.java/.systemPrefs/.systemRootModFile" do
  path lazy { "/etc/.java/.systemPrefs/.systemRootModFile" }
  owner "root"
  group "root"
  mode "544"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :immediately
end

directory node[:cdsinvocation][:deploy_artifacts][:properties_dir] do
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  recursive true
  action :create
end

template node[:cdsinvocation][:deploy_artifacts][:properties_file] do
  source "cdsinvocation.properties.erb"
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :delayed
end

directory "#{node[:tomcat][:webapp_dir]}/cds-results-service" do
  recursive true
  action :nothing
end

directory "#{node[:tomcat][:webapp_dir]}/cds-metrics-service" do
  recursive true
  action :nothing
end

remote_file "#{Chef::Config[:file_cache_path]}/cds-metrics-service.war" do
  source node[:cdsinvocation][:metrics][:source]
  mode "0755"
  use_conditional_get true
  notifies :stop, "service[#{node[:tomcat][:service]}]", :immediately
  notifies :delete, "directory[#{node[:tomcat][:webapp_dir]}/cds-metrics-service]", :immediately
  notifies :delete, "file[#{node[:tomcat][:webapp_dir]}/cds-metrics-service.war]", :immediately
end

remote_file "#{Chef::Config[:file_cache_path]}/cds-results-service.war" do
  source node[:cdsinvocation][:results][:source]
  mode "0755"
  use_conditional_get true
  notifies :stop, "service[#{node[:tomcat][:service]}]", :immediately
  notifies :delete, "directory[#{node[:tomcat][:webapp_dir]}/cds-results-service]", :immediately
  notifies :delete, "file[#{node[:tomcat][:webapp_dir]}/cds-results-service.war]", :immediately
end

file "#{node[:tomcat][:webapp_dir]}/cds-metrics-service.war" do
  content lazy { IO.read("#{Chef::Config[:file_cache_path]}/cds-metrics-service.war") }
  owner "root"
  group "root"
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :immediately
end

file "#{node[:tomcat][:webapp_dir]}/cds-results-service.war" do
  content lazy { IO.read("#{Chef::Config[:file_cache_path]}/cds-results-service.war") }
  owner "root"
  group "root"
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :immediately
end
