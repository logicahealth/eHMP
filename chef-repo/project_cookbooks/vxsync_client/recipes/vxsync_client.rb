#
# Cookbook Name:: vxsync
# Recipe:: vxsync_client
#

if "#{node[:vxsync][:hdr_mode]}" == "PUB/SUB"
  puts "HDR IS IN PUB/SUB MODE!"
  hdr_sites.each do |hdr_site|
    hdr_site[:hdr][:hdr_sites].each do |site|
      node.default[:vxsync_client][:processes]["pollerHost-#{site['site_id']}".to_sym] = {
        :template => "poller_host.sh.erb",
        :config => {
          :site => site['site_id']
        },
      }
    end
  end
end

if node[:roles].include?("vxsync_error_processor")
  node.default[:vxsync_client][:processes] = node[:vxsync_client][:processes].merge(node[:vxsync_client][:error_processes])
end

vxsync_instance "client" do
  vista_sites find_multiple_nodes_by_role("vista-.*", node[:stack])
  processes node[:vxsync_client][:processes]
  vxsync_environments find_multiple_nodes_by_role("vxsync", node[:stack])
end

cron "record_retirement" do
  minute node[:vxsync_client][:record_retirement][:minute]
  hour node[:vxsync_client][:record_retirement][:hour]
  weekday node[:vxsync_client][:record_retirement][:weekday]
  command "cd #{node[:vxsync_client][:home_dir]}; /usr/local/bin/node ./utils/patient-record-retirement/run-patient-record-retirement-util.js >> #{node[:vxsync_client][:log_directory]}/#{node[:vxsync_client][:record_retirement][:log_file]}"
  action node[:vxsync_client][:record_retirement][:enabled] ? :create : :delete
end

include_recipe "vxsync_client::nerve"
