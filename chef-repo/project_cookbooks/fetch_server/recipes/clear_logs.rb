#
# Cookbook Name:: fetch_server
# Recipe:: clear_logs
#

logrotate_fetch_server_filepath = "/etc/logrotate.d/#{node[:fetch_server][:logrotate][:name]}"
execute 'rotate-fetch_server-logs' do
  command "logrotate -f #{logrotate_fetch_server_filepath}"
  only_if { File.exists?(logrotate_fetch_server_filepath) }
end
