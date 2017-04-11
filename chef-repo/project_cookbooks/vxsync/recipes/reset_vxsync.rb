#
# cookbook: vxsync
# recipe: reset_vxsync
#

log "Force hard reset when in dev or test environments" do
	notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
	only_if { node[:reset_vxsync][:reset] }
end

vxsync_reset_sync "reset_vxsync" do
	reset node[:reset_vxsync][:reset]
	action :nothing
end
