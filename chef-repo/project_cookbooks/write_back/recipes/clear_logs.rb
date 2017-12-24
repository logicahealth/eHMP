#
# Cookbook Name:: write_back
# Recipe:: clear_logs
#

logrotate_write_back_filepath = "/etc/logrotate.d/#{node[:write_back][:logrotate][:name]}"
execute 'rotate-write_back-logs' do
  command "logrotate -f #{logrotate_write_back_filepath}"
  only_if { File.exists?(logrotate_write_back_filepath) }
end
