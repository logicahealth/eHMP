remote_directory "#{node[:activity_handler][:activity_handler_ops_scripts_dir]}" do
  source "tools-activities"
  owner node[:activity_handler][:user]
  group node[:activity_handler][:group]
  mode '0777'
  files_owner node[:activity_handler][:user]
  files_group node[:activity_handler][:group]
  files_mode '0755'
  recursive true
end
