#
# Cookbook Name:: jds
# Resource:: create_prod_user
#

action :create do

  store_url = new_resource.store_url
  data_bag_info = new_resource.data_bag_info
  store_info = JSON.parse(`curl -s #{store_url}/#{data_bag_info['uid']}`)

  class Hash
    def dig(*path)
      path.inject(self) do |location, key|
        location.respond_to?(:keys) ? location[key] : nil
      end
    end
  end

  if !store_info.has_key?("createdBy")
    new_info = data_bag_info
  else
    new_info = store_info
    if data_bag_info.has_key?("nationalAccess")
      new_info["nationalAccess"] = data_bag_info["nationalAccess"]
    end
    if data_bag_info.dig("permissionSet", "val") && data_bag_info["permissionSet"]["val"].include?("acc")
      new_info["permissionSet"] = {} if new_info["permissionSet"].nil?
      new_info["permissionSet"]["val"] = [] if new_info["permissionSet"]["val"].nil?
      new_info["permissionSet"]["val"].push("acc") unless new_info["permissionSet"]["val"].include?("acc")
    end
    ["read-permission-sets", "add-permission-sets", "edit-permission-sets", "deprecate-permission-sets"].each do |permission|
      if data_bag_info.dig("permissionSet", "additionalPermissions") && data_bag_info["permissionSet"]["additionalPermissions"].include?(permission)
        new_info["permissionSet"] = {} if new_info["permissionSet"].nil?
        new_info["permissionSet"]["additionalPermissions"] = [] if new_info["permissionSet"]["additionalPermissions"].nil?
        new_info["permissionSet"]["additionalPermissions"].push(permission) unless new_info["permissionSet"]["additionalPermissions"].include?(permission)
      end
    end
  end

  http_request "#{new_info["uid"]}_put" do
    message new_info.to_json
    url "#{store_url}/#{data_bag_info['uid']}"
    action :put
  end
end
