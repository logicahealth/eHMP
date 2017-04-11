#
# Cookbook Name:: cdsdashboard
# Recipe:: wargames
#

directory "/etc/.java/.systemPrefs" do
  owner "root"
  group "root"
  mode "0755"
  recursive true
end

remote_file "#{Chef::Config[:file_cache_path]}/cdsdashboard.war" do
  source node[:cdsdashboard][:deploy_war][:source]
  mode "0755"
  use_conditional_get true
end

file "#{node[:tomcat][:webapp_dir]}/cdsdashboard.war" do
  content lazy { IO.read("#{Chef::Config[:file_cache_path]}/cdsdashboard.war") }
  owner "root"
  group "root"
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :delayed
end
