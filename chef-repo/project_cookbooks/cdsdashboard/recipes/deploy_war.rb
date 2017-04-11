#
# Cookbook Name:: cdsdashboard
# Recipe:: wargames
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

directory "#{node[:tomcat][:webapp_dir]}/cdsdashboard" do
  recursive true
  action :nothing
end

remote_file "#{Chef::Config[:file_cache_path]}/cdsdashboard.war" do
  source node[:cdsdashboard][:deploy_war][:source]
  mode "0755"
  use_conditional_get true
  notifies :stop, "service[#{node[:tomcat][:service]}]", :immediately
  notifies :delete, "directory[#{node[:tomcat][:webapp_dir]}/cdsdashboard]", :immediately
  notifies :delete, "file[#{node[:tomcat][:webapp_dir]}/cdsdashboard.war]", :immediately
end

file "#{node[:tomcat][:webapp_dir]}/cdsdashboard.war" do
  content lazy { IO.read("#{Chef::Config[:file_cache_path]}/cdsdashboard.war") }
  owner "root"
  group "root"
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :immediately
end
