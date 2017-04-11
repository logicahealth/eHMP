#
# Cookbook Name:: rdk
# Recipe:: clear_logs
#

Dir.glob("#{node[:rdk][:log_dir]}/*.log").each do |log|
  if File.exists?(log)
    file "#{log}.bak" do
      mode 0755
      content ::File.open("#{log}").read
      action :create
      backup false # This is to stop backing up the file in /var/chef/backup
    end

    file "#{log}" do
      mode 0755
      content ""
      action :create
      backup false # This is to stop backing up the file in /var/chef/backup
    end
  end
end
