#
# Cookbook Name:: jds
# Recipe:: jds_data
#
# This recipe is used to add users to a jds instance
#

yum_package "unzip"

execute "delete jds_data directory to reinstall" do
  command "rm -rf #{node[:jds][:jds_data][:dir]}"
  action :run
  only_if { node[:jds][:build_jds] }
end

remote_file "#{Chef::Config[:file_cache_path]}/#{node[:jds][:jds_data][:artifact_name]}.zip" do
  source node[:jds][:jds_data][:source]
  mode "0755"
  use_conditional_get true
  notifies :delete, "directory[#{node[:jds][:jds_data][:dir]}]", :immediately
end

directory node[:jds][:jds_data][:dir] do
	recursive true
	action :create
end

jds_post_data "post_test_data" do
	stores	["ehmpusers", "permset", "permission", "teamlist", "trustsys"]
	data_dir node[:jds][:jds_data][:dir]
	action :nothing
end

execute "unzip_jds_data" do
	cwd "#{Chef::Config[:file_cache_path]}"
	command "unzip #{Chef::Config[:file_cache_path]}/#{node[:jds][:jds_data][:artifact_name]}.zip -d /tmp/jds_data"
	only_if { (Dir.entries(node[:jds][:jds_data][:dir]) - %w{ . .. }).empty? }
	notifies :execute, "jds_post_data[post_test_data]", :immediately
end


