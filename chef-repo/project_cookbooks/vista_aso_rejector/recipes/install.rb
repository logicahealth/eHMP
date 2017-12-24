#
# Cookbook Name:: vista_aso_rejector
# Recipe:: install
#

include_recipe "vista_aso_rejector::service" # Included due to dependency to service resource

remote_file "#{Chef::Config['file_cache_path']}/vista_aso_rejector.zip" do
  source node[:vista_aso_rejector][:source]
  mode   "0755"
  owner node[:vista_aso_rejector][:user]
  group node[:vista_aso_rejector][:group]
  use_conditional_get true
  notifies :stop, "service[#{node[:vista_aso_rejector][:service_config][:name]}]", :immediately
  notifies :delete, "directory[#{node[:vista_aso_rejector][:home_dir]}]", :immediately
  not_if ("mountpoint -q #{node[:vista_aso_rejector][:home_dir]}")
end

directory node[:vista_aso_rejector][:home_dir] do
  mode "0755"
  recursive true
  owner node[:vista_aso_rejector][:user]
  group node[:vista_aso_rejector][:group]
  action :create
end

directory node[:vista_aso_rejector][:log_dir] do
  mode "0755"
  recursive true
  owner node[:vista_aso_rejector][:user]
  group node[:vista_aso_rejector][:group]
  action :create
  notifies :run, "execute[#{node[:vista_aso_rejector][:log_dir]}_ownership_correction]", :immediately
end

execute "#{node[:vista_aso_rejector][:log_dir]}_ownership_correction" do
  command "chown -R #{node[:vista_aso_rejector][:user]}:#{node[:vista_aso_rejector][:group]} #{node[:vista_aso_rejector][:log_dir]}"
  action :nothing
  only_if { Dir.exist? node[:vista_aso_rejector][:log_dir] }
end

directory node[:vista_aso_rejector][:pid_dir] do
  mode "0755"
  recursive true
  owner node[:vista_aso_rejector][:user]
  group node[:vista_aso_rejector][:group]
  action :create
end

execute "#{node[:vista_aso_rejector][:pid_dir]}_ownership_correction" do
  command "chown -R #{node[:vista_aso_rejector][:user]}:#{node[:vista_aso_rejector][:group]} #{node[:vista_aso_rejector][:pid_dir]}"
  action :nothing
  only_if { Dir.exist? node[:vista_aso_rejector][:pid_dir] }
end

common_extract "#{Chef::Config['file_cache_path']}/vista_aso_rejector.zip" do
  directory node[:vista_aso_rejector][:home_dir]
  owner node[:vista_aso_rejector][:user]
  action :extract_if_missing
  notifies :stop, "service[#{node[:vista_aso_rejector][:service_config][:name]}]", :before
  notifies :restart, "service[#{node[:vista_aso_rejector][:service_config][:name]}]"
  not_if ("mountpoint -q #{node[:vista_aso_rejector][:home_dir]}")
end
