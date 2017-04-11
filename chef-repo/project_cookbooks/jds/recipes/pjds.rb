#
# Cookbook Name:: jds
# Recipe:: pjds
#
# This recipe is used to install the Persistent JDS specific components
#

# We must verify the indexes are in a good state, and remove them if they are not; this has to happen first
node[:jds][:data_store].each do |key,store|
  jds_mumps_block "ensure_index_and_data_are_gone_if_one_is_missing" do
    cache_username node[:jds][:default_admin_user]
    cache_password Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"]
    namespace node[:jds][:cache_namespace]
    command [
      "i '$D(^VPRCONFIG(\"store\",\"#{store}\",\"index\")),$D(^VPRMETA(\"index\",\"#{store}_uid\")) W \"pJDS index in invalid state - removing\" k ^VPRMETA(\"index\",\"#{store}_uid\") K ^VPRMETA(\"collection\",\"#{store}\",\"index\",\"#{store}_uid\")"
    ]
    log node[:jds][:chef_log]
  end
end

include_recipe "jds::jds_data"
include_recipe "jds::pjds_indexing"
