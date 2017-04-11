#
# Cookbook Name:: oracle_wrapper
# Recipe:: create_secret
#

# creates secret that is expected by the third party oracle cookbook
file "/etc/chef/encrypted_data_bag_secret" do
  content "n25q2mp#h4"
  action :nothing
end.run_action(:create)
