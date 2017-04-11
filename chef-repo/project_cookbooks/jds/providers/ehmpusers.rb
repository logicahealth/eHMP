#
# Cookbook Name:: jds
# Resource:: data
#

action :execute do

  store = new_resource.store || new_resource.name
  store_url = "http://localhost:#{new_resource.port}/#{store}"
  data_path = "#{new_resource.data_dir}/#{store}.json"

  if !node[:jds][:jds_data][:use_artifact][:ehmpusers]
    list = []
    sites = find_multiple_nodes_by_role("vista-.*", node[:stack])
    sites.each do |site|
      begin
        site_users = site['vista']['jds_data']['ehmpusers']
        list = list + site_users
      rescue
        Chef::Log.warn("No ehmpusers specified for #{site['vista']['site_id']}")
      end
    end
  else
    list = JSON.parse(::File.read(data_path))
  end

  if !list.empty?

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
      ruby_block "check if #{item['uid']} exists" do
        block do
          puts "\nWARNING:  #{item['uid']} alread exists in #{store}.  We will skip modifying #{item['uid']}"
        end
        only_if { item_exists?("http://localhost:#{new_resource.port}/#{store}/#{item['uid']}", "createdBy") }
      end

      http_request "#{item["uid"]}_put" do
        message item.to_json
        url "http://localhost:#{new_resource.port}/#{store}/#{item['uid']}"
        action :put
        not_if { item_exists?("http://localhost:#{new_resource.port}/#{store}/#{item['uid']}", "createdBy") }
      end
    }

  else
    Chef::Log.warn("********** No ehmpusers to post; none were specified. **********")
  end

end
