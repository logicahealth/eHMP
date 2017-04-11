#
# Cookbook Name:: jds
# Recipe:: reset_sync
#

clinicobj_url = "http://#{node['ipaddress']}:#{node['jds']['cache_listener_ports']['general']}/clinicobj"
http_request "delete clinicobj data store" do
  url clinicobj_url
  only_if { data_store_exists?(clinicobj_url) }
  action :delete
end
