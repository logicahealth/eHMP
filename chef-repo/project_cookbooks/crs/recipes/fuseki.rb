#
# Cookbook Name:: crs
# Recipe:: fuseki
#

remote_file "#{Chef::Config[:file_cache_path]}/#{File.basename(node[:crs][:fuseki][:source])}" do
  user node[:crs][:user]
  group node[:crs][:group]
  source node[:crs][:fuseki][:source]
  use_conditional_get true
  notifies :delete, "directory[#{node[:crs][:fuseki][:home]}]", :immediately
end

directory node[:crs][:fuseki][:home] do
  owner node[:crs][:user]
  group node[:crs][:group]
  mode '0755'
  recursive true
  action :create
  notifies :run, "execute[update ownership of fuseki home dir]", :immediately
end

execute "update ownership of fuseki home dir" do
  command "chown -R #{node[:crs][:user]}:#{node[:crs][:group]} #{node[:crs][:fuseki][:home]}"
  action :nothing
  only_if { Dir.exist? node[:crs][:fuseki][:home] }
end

execute "extract jena_fuseki tar" do
  user node[:crs][:user]
  group node[:crs][:group]
  cwd node[:crs][:fuseki][:install_dir]
  command "tar -zxvf #{Chef::Config[:file_cache_path]}/#{File.basename(node[:crs][:fuseki][:source])}"
  action :run
  only_if { (Dir.entries(node[:crs][:fuseki][:home]) - %w{ . .. }).empty? }
  notifies :restart, "service[fuseki]", :delayed
end

directory "#{node[:crs][:fuseki][:base]}" do
  owner node[:crs][:user]
  group node[:crs][:group]
  mode '0755'
  recursive true
  action :create
end

directory "#{node[:crs][:fuseki][:configuration_dir]}" do
  owner node[:crs][:user]
  group node[:crs][:group]
  mode '0755'
  recursive true
  action :create
end

file "/etc/init/fuseki.conf" do
  content ""
  owner node[:crs][:user]
  group node[:crs][:group]
  notifies :restart, "service[fuseki]", :delayed
end

template "/etc/default/fuseki" do
  owner node[:crs][:user]
  group node[:crs][:group]
  mode "0644"
  variables(
    :fuseki_base => node[:crs][:fuseki][:base],
    :fuseki_home => node[:crs][:fuseki][:home],
    :fuseki_user => node[:crs][:user]
  )
  notifies :restart, "service[fuseki]", :delayed
end

cookbook_file "/etc/init.d/fuseki" do
  owner node[:crs][:user]
  group node[:crs][:group]
  source "fuseki"
  mode "0755"
  notifies :restart, "service[fuseki]", :delayed
end

cookbook_file "#{node[:crs][:fuseki][:home]}/run/shiro.ini" do
  owner node[:crs][:user]
  group node[:crs][:group]
  mode "0755"
  notifies :restart, "service[fuseki]", :delayed
end

template "#{node[:crs][:fuseki][:configuration_dir]}/ehmp.ttl" do
  owner node[:crs][:user]
  group node[:crs][:group]
  mode "0755"
  variables(
    :fuseki_base => node[:crs][:fuseki][:base],
  )
  notifies :restart, "service[fuseki]", :immediately
end

template "#{node[:crs][:fuseki][:configuration_dir]}/test.ttl" do
  owner node[:crs][:user]
  group node[:crs][:group]
  mode "0755"
  variables(
    :fuseki_base => node[:crs][:fuseki][:base],
  )
  notifies :restart, "service[fuseki]", :immediately
end

service "fuseki" do
  start_command "sudo service fuseki start"
  stop_command "sudo service fuseki stop"
  restart_command "sudo service fuseki stop; sudo service fuseki start; sleep 5"
  action [:enable, :start]
end
