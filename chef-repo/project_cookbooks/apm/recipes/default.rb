#
# Cookbook Name:: apm
# Recipe:: default
#

remote_file "#{Chef::Config['file_cache_path']}/CollectorAgent.tar" do
  source node[:apm][:agent][:source]
  mode "0755"
  use_conditional_get true
  notifies :delete, "directory[#{node[:apm][:agent][:path]}]", :immediately
end

directory node[:apm][:agent][:path] do
  mode "0755"
  action :create
end

execute "extract Collector Agent" do
  cwd node[:apm][:agent][:path]
  command "tar -xvf #{Chef::Config['file_cache_path']}/CollectorAgent.tar"
  action :run
  notifies :run, "execute[install Collector Agent]", :immediately
  only_if { (Dir.entries(node[:apm][:agent][:path]) - %w{ . .. }).empty? } 
end

execute "install Collector Agent" do
  command "#{node[:apm][:agent][:path]}/bin/CollectorAgent.sh install"
  action :nothing
  notifies :stop, "service[collector_agent]", :before
  notifies :restart, "service[collector_agent]"
end

service "collector_agent" do
  action [:enable, :start]
end

template "#{node[:apm][:agent][:path]}/core/config/IntroscopeCollectorAgent.profile" do
  source "IntroscopeCollectorAgent.profile.erb"
  variables(
      :host => node[:apm][:agent][:host],
      :port => node[:apm][:agent][:port]
    )
  action :create
  notifies :restart, "service[collector_agent]", :immediately
end