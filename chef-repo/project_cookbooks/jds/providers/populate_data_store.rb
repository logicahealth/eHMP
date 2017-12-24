#
# Cookbook Name:: jds
# Resource:: data_store
#

action :execute do
  raise "populate_params is required" if new_resource.populate_params.nil?
  store = new_resource.store || new_resource.name
  store_url = "http://localhost:#{new_resource.port}/#{store}"

  if !new_resource.populate_params['data_bag'].nil?
    list = data_bag_item('jds_data',new_resource.populate_params['data_bag'])
  else
    list = JSON.parse(::File.read("#{node[:jds][:jds_data][:dir]}/#{store}.json"))
  end

  list.each do |item|

    identifier = item["#{new_resource.populate_params['identifier_field']}"]
    if store == "teamlist"
      post_url = store_url
      check_url = "#{store_url}/?filter=eq(facility,#{identifier})"
    elsif store == "entordrbls"
      escaped_name = URI.escape("\"#{identifier}\"");
      post_url = "#{store_url}/"
      check_url = "http://localhost:#{new_resource.port}/#{store}/?filter=eq(name,#{escaped_name})"
    else
      post_url = "#{store_url}/#{identifier}"
      check_url = "#{store_url}/#{identifier}"
    end

    http_request "#{identifier}_put" do
      message item.to_json
      url post_url
      action new_resource.populate_params['action']
      not_if { !new_resource.populate_params['allow_overwrite'] && item_exists?(check_url, new_resource.populate_params['check_for_field']) }
    end
  end
end
