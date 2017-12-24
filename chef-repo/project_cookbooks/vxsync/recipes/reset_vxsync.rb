#
# cookbook: vxsync
# recipe: reset_vxsync
#

log "Force hard reset when in dev or test environments" do
	notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
	only_if { node[:reset_vxsync][:reset] }
end

vxsync_reset_sync "reset_vxsync" do
	reset node[:reset_vxsync][:reset] && !(node[:vxsync][:vxsync_applications] == ["vista"]) && !(node[:vxsync][:vxsync_applications] == ["client"] && !node[:roles].include?("primary_vxsync_client"))
	node['vxsync']['vxsync_applications'].each { |app| subscribes :execute, "beanstalk_instance[#{app}]" }
	node['vxsync']['vxsync_applications'].each { |app| subscribes :execute, "vxsync_instance[#{app}]" }
	action :nothing
end
