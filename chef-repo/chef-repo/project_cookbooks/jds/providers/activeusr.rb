#
# Cookbook Name:: jds
# Resource:: activeusr
#
require 'uri'

action :execute do

  store = new_resource.store || new_resource.name
  store_url = "http://localhost:#{new_resource.port}/#{store}"

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

end
