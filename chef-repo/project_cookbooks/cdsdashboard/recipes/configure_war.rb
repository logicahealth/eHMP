#
# Cookbook Name:: cdsdashboard
# Recipe:: configure_war
#

common_directory "#{node[:tomcat][:home]}/shared/classes" do
  recursive true
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
end

template("#{node[:tomcat][:home]}/shared/classes/cds-dashboard.properties") do
  source "cds-dashboard.properties.erb"
  variables(
    :fetch_server_host => "localhost",
    :fetch_server_port => node[:synapse][:services][:fetch_server][:haproxy][:port]
  )
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :delayed
end

template "#{node['tomcat']['home']}/shared/classes/log4j2.xml" do
  source "log4j2.xml.erb"
  owner node['tomcat']['user']
  mode "0755"
  notifies :touch, "file[#{node[:tomcat][:webapp_dir]}/cdsdashboard.war]", :delayed
end
