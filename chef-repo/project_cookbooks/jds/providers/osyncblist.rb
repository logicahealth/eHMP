#
# Cookbook Name:: jds
# Resource:: osynclinic
#
require 'uri'

action :execute do

  store = new_resource.store || new_resource.name
  store_url = "http://localhost:#{new_resource.port}/#{store}"

  if !node[:jds][:jds_data][:data_bag][:osyncblist].nil?
    list = data_bag_item('jds_data',node[:jds][:jds_data][:data_bag][:osyncblist]).to_hash["override"]
  else
    list =JSON.parse("{}")
  end

  http_request "ensure cache is listening before hitting #{store}" do
    url store_url
    retries 5
    action :get
  end

  http_request "delete_#{store}" do
    url store_url
    message {}
    action :delete
    only_if { new_resource.delete_store }
  end

  http_request "put_#{store}" do
    url store_url
    message {}
    action :put
    not_if { item_exists?(store_url,"instance_start_time") }
  end

  list.each{ |item|
    escaped_name = URI.escape("\"#{item['name']}\"");

    ruby_block "check if #{item['name']} exists" do
      block do
        puts "\nWARNING:  #{item['name']} already exists in #{store}.  We will skip modifying #{item['name']}"
      end
      only_if { item_exists?("http://localhost:#{new_resource.port}/#{store}/?filter=eq(name,#{escaped_name})","items") }
    end

    http_request "#{item["name"]}_put" do
      message item.to_json
      url "http://localhost:#{new_resource.port}/#{store}/"
      action :put
      not_if { item_exists?("http://localhost:#{new_resource.port}/#{store}/?filter=eq(name,#{escaped_name})","items") }
    end
  }

end
