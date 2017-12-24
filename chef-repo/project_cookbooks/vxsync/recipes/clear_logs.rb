#
# Cookbook Name:: vxsync
# Recipe:: clear_logs
#

node[:vxsync][:vxsync_applications].each do |app|
  Chef::Log.info "processing vxsync clear_logs for vxsync app #{app}"
  node["vxsync_#{app}".to_sym][:processes].each do |name,process_block|
    1.upto(process_block[:number_of_copies] || 1) do |index|
      if index==1 then suffix = "" else suffix = "_#{index}" end
      log = "#{node[:vxsync][:log_directory]}/#{name}#{suffix}_stderr.log"
      if File.exists?(log)
        file "#{log}.bak" do
          mode 0755
          content ::File.open("#{log}").read
          action :create
        end

        file "#{log}" do
          mode 0755
          content ""
          action :create
        end
      end
    end
  end
end
