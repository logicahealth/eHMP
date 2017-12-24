#
# Cookbook Name:: pick_list
# Recipe:: clear_logs
#

logrotate_pick_list_filepath = "/etc/logrotate.d/#{node[:pick_list][:logrotate][:name]}"
execute 'rotate-pick_list-logs' do
  command "logrotate -f #{logrotate_pick_list_filepath}"
  only_if { File.exists?(logrotate_pick_list_filepath) }
end
