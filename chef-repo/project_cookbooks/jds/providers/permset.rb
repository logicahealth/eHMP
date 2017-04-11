#
# Cookbook Name:: jds
# Resource:: permset
#

action :execute do

  store_name = new_resource.store_name || ::File.basename(new_resource.name, ".*")
  data_path = new_resource.data_path || new_resource.name

  list = JSON.parse(::File.read(data_path))

  list.each{ |item|
    http_request "#{item["uid"]}_put" do
      message item.to_json
      url "http://localhost:#{node[:jds][:cache_listener_ports][:general]}/#{store_name}/#{item['uid']}"
      action :put
    end
  }
  
end
