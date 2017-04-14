#
# Cookbook Name:: jds
# Recipe:: osync_pjds
#
# This recipe is used to manage osync data store indexes
#

http_request "osynclinic site index" do
    url "http://#{node[:ipaddress]}:#{node[:jds][:cache_listener_ports][:general]}/osynclinic/index"
    message  ({
      :indexName => "osynclinic-site",
      :fields => "site",
      :sort => "desc",
      :type => "attr"
    }.to_json)
    action :post
    not_if { item_exists?("http://#{node[:ipaddress]}:#{node[:jds][:cache_listener_ports][:general]}/osynclinic/index/osynclinic-site", "items") }
end

http_request "osyncblist site index" do
    url "http://#{node[:ipaddress]}:#{node[:jds][:cache_listener_ports][:general]}/osyncblist/index"
    message  ({
      :indexName => "osyncblist-user",
      :fields => "site, uid",
      :sort => "desc",
      :type => "attr",
      :setif => "$$OSYNCUSER^VPRJFPS"
    }.to_json)
    action :post
    not_if { item_exists?("http://#{node[:ipaddress]}:#{node[:jds][:cache_listener_ports][:general]}/osyncblist/index/osyncblist-user", "items") }
end

http_request "osyncblist patient index" do
    url "http://#{node[:ipaddress]}:#{node[:jds][:cache_listener_ports][:general]}/osyncblist/index"
    message  ({
      :indexName => "osyncblist-patient",
      :fields => "site, uid",
      :sort => "desc",
      :type => "attr",
      :setif => "$$OSYNCPAT^VPRJFPS"
    }.to_json)
    action :post
    not_if { item_exists?("http://#{node[:ipaddress]}:#{node[:jds][:cache_listener_ports][:general]}/osyncblist/index/osyncblist-patient", "items") }
end
