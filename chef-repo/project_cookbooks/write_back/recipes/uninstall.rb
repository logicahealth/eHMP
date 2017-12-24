#
# Cookbook Name:: write_back
# Recipe:: uninstall
#

service "#{node[:write_back][:service_config][:name]} uninstall" do
  service_name node[:write_back][:service_config][:name]
  provider Chef::Provider::Service::Upstart
  action [:disable, :stop]
  only_if { File.exists?("/etc/bluepill/#{node[:write_back][:service_config][:name]}.pill") }
end

file "/etc/bluepill/#{node[:write_back][:service_config][:name]}.pill" do
  action :delete
  only_if { Dir.exists?('/etc/bluepill') }
end

directory node[:write_back][:home_dir] do
  recursive true
  action :delete
end

directory node[:write_back][:pid_dir] do
  recursive true
  action :delete
end

ruby_block 'write back nerve file cleanup' do
  block do
    nerve_list = Dir.glob("#{node[:nerve][:nerve_conf_dir]}/*#{node[:write_back][:service_config][:name]}*")
    nerve_list.each do |nerve_file|
       File.delete nerve_file
    end
  end
end
