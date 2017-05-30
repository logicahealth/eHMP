#
# Cookbook Name:: jds
# Recipe:: jds_data
#
# This recipe is used to add artifact data to a jds instance
#

yum_package "unzip"

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
	only_if { unzip_jds_data_resource.updated_by_last_action? && node[:jds][:jds_data][:use_artifact][:entordrbls] }
end

# only_if (artifact has been updated) || (we're in a VA environment)
# result:  this only runs in Dev when artifact is updated;  this always run in VA environments
jds_ehmpusers "ehmpusers" do
	data_dir node[:jds][:jds_data][:dir]
	delete_store node[:jds][:jds_data][:delete_stores]
	port node[:jds][:cache_listener_ports][:general]
	only_if { unzip_jds_data_resource.updated_by_last_action? || !node[:jds][:jds_data][:use_artifact][:ehmpusers] }
end

jds_permset "permset" do
	data_dir node[:jds][:jds_data][:dir]
	delete_store node[:jds][:jds_data][:delete_permsets]
	port node[:jds][:cache_listener_ports][:general]
	only_if { unzip_jds_data_resource.updated_by_last_action? && node[:jds][:jds_data][:use_artifact][:permset] }
end

jds_permission "permission" do
	data_dir node[:jds][:jds_data][:dir]
	delete_store node[:jds][:jds_data][:delete_stores]
	port node[:jds][:cache_listener_ports][:general]
	only_if { unzip_jds_data_resource.updated_by_last_action? && node[:jds][:jds_data][:use_artifact][:permission] }
end

jds_teamlist "teamlist" do
data_dir node[:jds][:jds_data][:dir]
	delete_store node[:jds][:jds_data][:delete_stores]
	port node[:jds][:cache_listener_ports][:general]
	only_if { unzip_jds_data_resource.updated_by_last_action? && node[:jds][:jds_data][:use_artifact][:teamlist] }
end

jds_trustsys "trustsys" do
	data_dir node[:jds][:jds_data][:dir]
	delete_store node[:jds][:jds_data][:delete_stores]
	port node[:jds][:cache_listener_ports][:general]
	only_if { unzip_jds_data_resource.updated_by_last_action? && node[:jds][:jds_data][:use_artifact][:trustsys] }
end

jds_osynclinic "osynclinic" do
	delete_store node[:jds][:jds_data][:delete_stores]
	port node[:jds][:cache_listener_ports][:general]
	only_if { unzip_jds_data_resource.updated_by_last_action? && node[:jds][:jds_data][:use_artifact][:osynclinic] }
end

jds_osynclinic "osyncblist" do
	delete_store node[:jds][:jds_data][:delete_stores]
	port node[:jds][:cache_listener_ports][:general]
	only_if { unzip_jds_data_resource.updated_by_last_action? && node[:jds][:jds_data][:use_artifact][:osyncblist] }
end

jds_activeusr "activeusr" do
	delete_store node[:jds][:jds_data][:delete_stores]
	port node[:jds][:cache_listener_ports][:general]
	only_if { node[:jds][:jds_data][:use_artifact][:activeusr] }
end

jds_prefetch "prefetch" do
	delete_store node[:jds][:jds_data][:delete_stores]
	port node[:jds][:cache_listener_ports][:general]
	only_if { unzip_jds_data_resource.updated_by_last_action? && node[:jds][:jds_data][:use_artifact][:prefetch] }
end

