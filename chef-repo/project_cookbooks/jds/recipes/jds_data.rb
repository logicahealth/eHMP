#
# Cookbook Name:: jds
# Recipe:: jds_data
#
# This recipe is used to add users to a jds instance
#

yum_package "unzip"

directory "delete jds_data directory for jds rebuild" do
  path node[:jds][:jds_data][:dir]
  recursive true
  action :delete
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

unzip_jds_data_resource = execute("unzip_jds_data") do
	cwd "#{Chef::Config[:file_cache_path]}"
	command "unzip #{Chef::Config[:file_cache_path]}/#{node[:jds][:jds_data][:artifact_name]}.zip -d /tmp/jds_data"
	only_if { (Dir.entries(node[:jds][:jds_data][:dir]) - %w{ . .. }).empty? }
end

jds_entordrbls "entordrbls" do
	data_dir node[:jds][:jds_data][:dir]
	delete_store node[:jds][:jds_data][:delete_stores]
	port node[:jds][:cache_listener_ports][:general]
	only_if { unzip_jds_data_resource.updated_by_last_action? || !node[:jds][:jds_data][:data_bag][:entordrbls].nil? }
end

jds_ehmpusers "ehmpusers" do
	data_dir node[:jds][:jds_data][:dir]
	delete_store node[:jds][:jds_data][:delete_stores]
	port node[:jds][:cache_listener_ports][:general]
	only_if { unzip_jds_data_resource.updated_by_last_action? || !node[:jds][:jds_data][:data_bag][:ehmpusers].nil? }
end

jds_permset "permset" do
	data_dir node[:jds][:jds_data][:dir]
	delete_store node[:jds][:jds_data][:delete_stores]
	port node[:jds][:cache_listener_ports][:general]
	only_if { unzip_jds_data_resource.updated_by_last_action? || !node[:jds][:jds_data][:data_bag][:permset].nil? }
end

jds_permission "permission" do
	data_dir node[:jds][:jds_data][:dir]
	delete_store node[:jds][:jds_data][:delete_stores]
	port node[:jds][:cache_listener_ports][:general]
	only_if { unzip_jds_data_resource.updated_by_last_action? || !node[:jds][:jds_data][:data_bag][:permission].nil? }
end

jds_teamlist "teamlist" do
data_dir node[:jds][:jds_data][:dir]
	delete_store node[:jds][:jds_data][:delete_stores]
	port node[:jds][:cache_listener_ports][:general]
	only_if { unzip_jds_data_resource.updated_by_last_action? || !node[:jds][:jds_data][:data_bag][:teamlist].nil? }
end

jds_trustsys "trustsys" do
	data_dir node[:jds][:jds_data][:dir]
	delete_store node[:jds][:jds_data][:delete_stores]
	port node[:jds][:cache_listener_ports][:general]
	only_if { unzip_jds_data_resource.updated_by_last_action? || !node[:jds][:jds_data][:data_bag][:trustsys].nil? }
end
