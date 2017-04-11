#
# Cookbook Name:: rdk
# Recipe:: clear_logs
#

logrotate_rdk_filepath = "/etc/logrotate.d/#{node[:rdk][:logrotate][:name]}"
execute 'rotate-rdk-logs' do
  command "logrotate -f #{logrotate_rdk_filepath}"
  only_if { File.exists?(logrotate_rdk_filepath) }
end
