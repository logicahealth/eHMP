#
# Cookbook Name:: activity_handler
# Recipe:: set_processes
#

processes = 0
vxsync_nodes = find_multiple_nodes_by_role("vxsync", node[:stack])
vxsync_nodes.each do |vxsync|
  processes = processes + vxsync['vxsync']['vxsync_applications'].length
end
node.normal[:activity_handler][:service_config][:processes] = processes * node[:activity_handler][:service_config][:handlers_per_vx]
