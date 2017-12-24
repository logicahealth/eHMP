#
# Cookbook Name:: activity_handler
# Recipe:: clear_logs
#

logrotate_activity_handler_filepath = "/etc/logrotate.d/#{node[:activity_handler][:logrotate][:name]}"
execute 'rotate-activity_handler-logs' do
  command "logrotate -f #{logrotate_activity_handler_filepath}"
  only_if { File.exists?(logrotate_activity_handler_filepath) }
end
