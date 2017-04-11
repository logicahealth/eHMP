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
    end

    file "#{log}" do
      mode 0755
      content ""
      action :create
    end
  end
end
