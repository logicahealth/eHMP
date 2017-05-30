#
# Cookbook Name:: jds
# Recipe:: prefetch_pjds
#
# This recipe is used to manage prefetch data store indexes
#

http_request "prefetch ehmp-patients index" do
    url "http://#{node[:ipaddress]}:#{node[:jds][:cache_listener_ports][:general]}/prefetch/index"
    message  ({
      :indexName => "ehmp-patients",
      :fields => "sourceDate, isEhmpPatient",
      :sort => "desc",
      :type => "attr"
    }.to_json)
    action :post
    not_if { item_exists?("http://#{node[:ipaddress]}:#{node[:jds][:cache_listener_ports][:general]}/prefetch/index/ehmp-patients", "items") }
end

http_request "prefetch source index" do
    url "http://#{node[:ipaddress]}:#{node[:jds][:cache_listener_ports][:general]}/prefetch/index"
    message  ({
      :indexName => "ehmp-source",
      :fields => "source, sourceDate, facility/s/\"\"",
      :sort => "desc",
      :type => "attr"
    }.to_json)
    action :post
    not_if { item_exists?("http://#{node[:ipaddress]}:#{node[:jds][:cache_listener_ports][:general]}/prefetch/index/ehmp-source", "items") }
end

http_request "prefetch minimal template" do
    url "http://#{node[:ipaddress]}:#{node[:jds][:cache_listener_ports][:general]}/prefetch/template"
    message  ({
      :name => "minimal",
      :directives => "include, applyOnSave",
      :fields => "patientIdentifier, isEhmpPatient"
    }.to_json)
    action :post
    not_if { item_exists?("http://#{node[:ipaddress]}:#{node[:jds][:cache_listener_ports][:general]}/prefetch/index/prefetch_uid/minimal", "items") }
end