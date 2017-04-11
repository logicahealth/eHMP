#
# Cookbook Name:: vxsync
# Recipe:: deploy_vxsync
#

include_recipe "vxsync::cleanup_old_vxsync"

remote_file "#{node[:vxsync][:artifact_path]}" do
  use_conditional_get true
  source node[:vxsync][:source]
  mode   "0755"
  node[:vxsync][:vxsync_applications].each { |app| notifies :delete, "directory[#{node[:vxsync][app.to_sym][:home_dir]}]", :immediately }
end

node[:vxsync][:vxsync_applications].each { |app| include_recipe "vxsync::vxsync_#{app}" }
