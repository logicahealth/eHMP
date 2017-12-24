#
# Cookbook Name:: jds
# Resource:: create_data_store
#

action :execute do

  store = new_resource.store || new_resource.name
  store_url = "http://localhost:#{new_resource.port}/#{store}"
  user_password = Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"]

  jds_mumps_block "Add configuration for #{store} data store" do
    cache_username node[:jds][:default_admin_user]
    cache_password user_password
    namespace node[:jds][:cache_namespace]
    command [
      "D ADDSTORE^VPRJCONFIG(\"" + store + "\")"
    ]
    log node[:jds][:chef_log]
  end

  # We must verify the indexes are in a good state, and remove them if they are not;
  # this has to happen before data is attempted to load into the data store
  jds_mumps_block "ensure index and data are gone for #{store} if index is missing" do
    cache_username node[:jds][:default_admin_user]
    cache_password user_password
    namespace node[:jds][:cache_namespace]
    command [
      "I '$D(^VPRCONFIG(\"store\",\"#{store}\",\"index\")),$D(^VPRMETA(\"index\",\"#{store}_uid\")) W \"pJDS index in invalid state - removing\" K ^VPRMETA(\"index\",\"#{store}_uid\") K ^VPRMETA(\"collection\",\"#{store}\",\"index\",\"#{store}_uid\")"
    ]
    log node[:jds][:chef_log]
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
    only_if { new_resource.clear_store }
  end

  http_request "put_#{store}" do
    url store_url
    message {}
    action :put
    not_if { item_exists?(store_url,"instance_start_time") }
  end

  http_request "create_#{store}_uid_index" do
    url "#{store_url}/index"
    message  ({
      :indexName => "#{store}_uid",
      :fields => "uid",
      :sort => "uid asc",
      :type => "attr"
    }.to_json)
    action :post
    only_if { item_exists?("#{store_url}/index/#{store}_uid?bail=1", "error") }
  end

  if new_resource.index
    new_resource.index.each do |index_name,config|
      http_request "create_#{index_name}_index" do
        url "#{store_url}/index"
        message  (config.message.to_json)
        action :post
        only_if { item_exists?("#{store_url}/index/#{index_name}?bail=1", "error") }
      end
    end
  end

  if new_resource.template
    new_resource.template.each do |template_name,config|
      http_request "post_#{store}_#{template_name}_template" do
          url "#{store_url}/template"
          message  (config.message.to_json)
          action :post
          only_if { item_exists?("#{store_url}/index/#{store}_uid/#{template_name}?bail=1", "error") }
      end
    end
  end

end
