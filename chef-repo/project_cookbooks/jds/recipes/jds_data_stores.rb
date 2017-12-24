#
# Cookbook Name:: jds
# Recipe:: jds_data_stores
#
# This recipe is used to add jds only data stores
#

node[:jds][:jds_data_stores].each do |store,config|
  jds_create_data_store store do
    port node[:jds][:cache_listener_ports][:general]
    clear_store config[:clear_store]
    index config[:index]
    template config[:template]
  end
end
