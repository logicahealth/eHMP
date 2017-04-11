#
# Cookbook Name:: rdk
# Recipe:: merge_db
#

unless node[:rdk][:profile].nil?
  profile = data_bag_item("rdk_env", node[:rdk][:profile]).to_hash
  node.normal[:rdk].merge!(profile["rdk"])
end
