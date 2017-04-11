#
# Cookbook Name:: opencds
# Recipe:: deploy_war
#

directory node[:opencds][:deploy_war][:app_dir] do
  recursive true
  action :nothing
end

remote_file "#{Chef::Config[:file_cache_path]}/#{node[:opencds][:deploy_war][:app_name]}.war" do
  source node[:opencds][:deploy_war][:source]
  mode "0755"
  use_conditional_get true
  notifies :stop, "service[#{node[:tomcat][:service]}]", :immediately
  notifies :delete, "directory[#{node[:opencds][:deploy_war][:app_dir]}]", :immediately
  notifies :delete, "file[#{node[:opencds][:deploy_war][:deployed_war_file]}]", :immediately
end

file "#{node[:opencds][:deploy_war][:deployed_war_file]}" do
  content lazy { IO.read(node[:opencds][:deploy_war][:downloaded_war_file]) }
  owner "root"
  group "root"
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :immediately
end

link "#{node[:tomcat][:webapp_dir]}/opencds" do
  to node[:opencds][:deploy_war][:app_dir]
  owner node[:tomcat][:user]
  group node[:tomcat][:user]
  mode "0775"
end
