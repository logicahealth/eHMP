#
# Cookbook Name:: jds
# Resource:: post_data
#

action :execute do

  new_resource.stores.each{ |store|
    http_request "delete_#{store}" do
      url "http://localhost:#{node[:jds][:cache_listener_ports][:general]}/#{store}"
      message {}
      action :delete
    end

    http_request "put_#{store}" do
      url "http://localhost:#{node[:jds][:cache_listener_ports][:general]}/#{store}"
      message {}
      action :put
    end

    send("jds_#{store}","#{new_resource.data_dir}/#{store}.json")
  }
  
end
