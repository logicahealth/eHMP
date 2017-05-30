remote_directory "#{node[:rdk][:activity_handler_ops_scripts_dir]}" do
  source "tools-activities"
  owner 'root'
  group 'root'
  mode '0777'
  files_owner 'root'
  files_group 'root'
  files_mode '0755'
  recursive true
end
