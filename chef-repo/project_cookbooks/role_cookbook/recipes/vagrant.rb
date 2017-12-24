#
# Cookbook Name:: role_cookbook
# Recipe:: vagrant
#

node.default[:development] = true
node.default[:vxsync][:profile][:'jds-storage'][:'store-record'][:worker_count] = 3
node.default[:vxsync][:profile][:'solr-storage'][:'solr-record-storage'][:worker_count] = 3

# overrides for vx-sync handler processes
node.default[:vxsync_client][:processes][:subscriber_jds_storage_client][:number_of_copies] = 1
node.default[:vxsync_client][:processes][:subscriber_solr_storage_client][:number_of_copies] = 1

node.default[:vxsync_vista][:processes][:subscriber_jds_storage_vista][:number_of_copies] = 1
node.default[:vxsync_vista][:processes][:subscriber_solr_storage_vista][:number_of_copies] = 1


include_recipe "yum_wrapper::vistacore_yum"
include_recipe "ohai"
include_recipe "timezone-ii"
include_recipe "ntp"

swap_file "local_swap" do
	path "/local.swap"
	size 12288
	persist true
	action :create
end

package "nss" do
  action :upgrade
end
