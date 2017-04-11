#
# Cookbook Name:: crs
# Recipe:: fuseki
#

remote_file "#{Chef::Config[:file_cache_path]}/#{File.basename(node[:crs][:fuseki][:source])}" do
  source node[:crs][:fuseki][:source]
  use_conditional_get true
  notifies :delete, "directory[#{node[:crs][:fuseki][:base]}]", :immediately 
end

directory node[:crs][:fuseki][:base] do
  owner 'root'
  group 'root'
  mode '0755'
  recursive true
  action :create
end

execute "extract jena_fuseki tar" do
  cwd node[:crs][:fuseki][:install_dir]
  command "tar -zxvf #{Chef::Config[:file_cache_path]}/#{File.basename(node[:crs][:fuseki][:source])}"
  action :run
  only_if { (Dir.entries(node[:crs][:fuseki][:base]) - %w{ . .. }).empty? }
  notifies :restart, "service[fuseki]", :delayed
end

file "/etc/init/fuseki.conf" do
  content ""
  notifies :restart, "service[fuseki]", :delayed
end

directory node[:crs][:fuseki][:home]

template "/etc/default/fuseki" do
  owner "root"
  group "root"
  mode "0644"
  variables(
    :fuseki_base => node[:crs][:fuseki][:base],
    :fuseki_home => node[:crs][:fuseki][:home]
  )
  notifies :restart, "service[fuseki]", :delayed
end

file "/etc/init.d/fuseki" do
  owner "root"
  group "root"
  mode "0755"
  content lazy{ ::File.open("#{node[:crs][:fuseki][:base]}/fuseki").read }
  notifies :restart, "service[fuseki]", :delayed
end

directory "#{node[:crs][:fuseki][:base]}/run"

cookbook_file "#{node[:crs][:fuseki][:base]}/run/shiro.ini" do
  owner "root"
  group "root"
  mode "0755"
  notifies :restart, "service[fuseki]", :delayed
end

service "fuseki" do
  start_command "sudo service fuseki start"
  stop_command "sudo service fuseki stop"
  restart_command "sudo service fuseki stop; sudo service fuseki start; sleep 5"
  action [:enable, :start]
end
