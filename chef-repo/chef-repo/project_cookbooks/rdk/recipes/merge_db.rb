#
# Cookbook Name:: rdk
# Recipe:: merge_db
#

unless node[:rdk][:profile].nil?
	profile = Chef::EncryptedDataBagItem.load("rdk_env", node[:rdk][:profile], node[:data_bag_string])
	node.override[:rdk] = Chef::Mixin::DeepMerge.hash_only_merge(node[:rdk], profile["rdk"])
end

if node[:rdk][:services][:activity_handler][:vxsync_list].nil?
	vxsync_machines = find_multiple_nodes_by_role("vxsync", node[:stack])
	vxsync_list = []
	vxsync_machines.each{ |vxsync|
		vxsync_list << vxsync[:db_item]
	}
	node.normal[:rdk][:services][:activity_handler][:vxsync_list] = vxsync_list
	Chef::Log.warn "Warning:  node[:rdk][:services][:activity_handler][:vxsync_list] was NOT provided.
We will create an activity handler for all vxsync machines in the stack, #{node[:rdk][:services][:activity_handler][:vxsync_list]}."
else
	Chef::Log.info "Using the given given vxsync_list for activity_handler: #{node[:rdk][:services][:activity_handler][:vxsync_list]}"
end
node.normal[:rdk][:services][:activity_handler][:processes] = node[:rdk][:services][:activity_handler][:vxsync_list].length
