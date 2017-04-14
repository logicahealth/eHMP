#
# Cookbook Name:: jds
# Recipe:: pjds_indexing
#
# This recipe is used to manage default pJDS indexes
#

node[:jds][:data_store].each do |key,store|
  http_request "create_#{store}_uid_index" do
    url "http://#{node[:ipaddress]}:#{node[:jds][:cache_listener_ports][:general]}/#{store}/index"
    message  ({
      :indexName => "#{store}_uid",
      :fields => "uid",
      :sort => "desc",
      :type => "attr"
    }.to_json)
    action :post
    not_if { item_exists?("http://#{node[:ipaddress]}:#{node[:jds][:cache_listener_ports][:general]}/#{store}/index/#{store}_uid", "items") }
  end
end