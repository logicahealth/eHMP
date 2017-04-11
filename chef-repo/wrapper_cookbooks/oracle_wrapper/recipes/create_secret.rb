#
# Cookbook Name:: oracle_wrapper
# Recipe:: create_secret
#

# creates secret that is expected by the third party oracle cookbook
file "/etc/chef/encrypted_data_bag_secret" do
  content node[:data_bag_string]
  action :nothing
end.run_action(:create)
