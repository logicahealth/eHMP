#
# Cookbook Name:: crs
# Recipe:: deploy_crs
#

remote_file "#{Chef::Config[:file_cache_path]}/#{File.basename(node[:crs][:deploy_crs][:source])}" do
  source node[:crs][:deploy_crs][:source]
  use_conditional_get true
  notifies :delete, "directory[#{node[:crs][:deploy_crs][:extract_dir]}]", :immediately
end

directory node[:crs][:deploy_crs][:extract_dir] do
  owner node[:crs][:user]
  group node[:crs][:group]
  recursive true
  action :create
end

execute "extract crs tar" do
  command "tar -xzvf #{Chef::Config[:file_cache_path]}/#{File.basename(node[:crs][:deploy_crs][:source])} -C #{node[:crs][:deploy_crs][:extract_dir]}"
  action :run
  only_if { (Dir.entries("#{node[:crs][:deploy_crs][:extract_dir]}") - %w{ . .. }).empty? }
  notifies :execute, "crs_install_ttl[package]", :immediately
end

crs_install_ttl "package" do
  config "#{node[:crs][:deploy_crs][:extract_dir]}/config.json"
  config_dir "#{node[:crs][:fuseki][:configuration_dir]}"
  action :nothing
end
