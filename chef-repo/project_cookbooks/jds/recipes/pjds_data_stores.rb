#
# Cookbook Name:: jds
# Recipe:: pjds_data_stores
#
# This recipe is used to manage pjds only data stores
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
	command "unzip #{Chef::Config[:file_cache_path]}/#{node[:jds][:jds_data][:artifact_name]}.zip -d #{node[:jds][:jds_data][:dir]}"
	only_if { (Dir.entries(node[:jds][:jds_data][:dir]) - %w{ . .. }).empty? }
end

node[:jds][:pjds_data_stores].each do |store, config|

  jds_create_data_store store do
    port node[:jds][:cache_listener_ports][:general]
    clear_store config[:clear_store]
    index config[:index]
    template config[:template]
  end

  jds_populate_data_store store do
    port node[:jds][:cache_listener_ports][:general]
    populate_params config[:populate_params]
    only_if { config[:populate_store] }
  end

end

if node[:jds][:jds_data][:get_ehmpusers_from_vistas]
  list = []
  sites = find_multiple_nodes_by_role("vista-.*", node[:stack])
  sites.each do |site|
    begin
      site_users = site['vista']['jds_data']['ehmpusers']
      list = list + site_users
    rescue
      Chef::Log.warn("No ehmpusers specified for #{site['vista']['site_id']}")
    end
  end
  list.each{ |user|

    jds_create_prod_user "create_#{user["uid"]}" do
      data_bag_info user
      store_url "http://localhost:#{node[:jds][:cache_listener_ports][:general]}/ehmpusers"
    end
  }
end
