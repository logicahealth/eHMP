#
# Cookbook Name:: jds
# Recipe:: pjds
#
# This recipe is used to install the pJDS specific components
#

# We must verify the indexes are in a good state, and remove them if they are not;
# this has to happen before data is attempted to load into the data store
node[:jds][:data_store].each do |key,store|
  jds_mumps_block "ensure index and data are gone for #{store} if index is missing" do
    cache_username node[:jds][:default_admin_user]
    cache_password Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"]
    namespace node[:jds][:cache_namespace]
    command [
      "I '$D(^VPRCONFIG(\"store\",\"#{store}\",\"index\")),$D(^VPRMETA(\"index\",\"#{store}_uid\")) W \"pJDS index in invalid state - removing\" K ^VPRMETA(\"index\",\"#{store}_uid\") K ^VPRMETA(\"collection\",\"#{store}\",\"index\",\"#{store}_uid\")"
    ]
    log node[:jds][:chef_log]
  end
end

include_recipe "jds::jds_data"
include_recipe "jds::pjds_indexing"
include_recipe "jds::osync_pjds"
include_recipe "jds::prefetch_pjds"