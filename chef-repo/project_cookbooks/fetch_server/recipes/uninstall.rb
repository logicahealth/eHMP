#
# Cookbook Name:: fetch_server
# Recipe:: uninstall
#

service "#{node[:fetch_server][:service_config][:name]} uninstall" do
  service_name node[:fetch_server][:service_config][:name]
  provider Chef::Provider::Service::Upstart
  action [:disable, :stop]
  only_if { File.exists?("/etc/bluepill/#{node[:fetch_server][:service_config][:name]}.pill") }
end

file "/etc/bluepill/#{node[:fetch_server][:service_config][:name]}.pill" do
  action :delete
  only_if { Dir.exists?('/etc/bluepill') }
end

directory node[:fetch_server][:home_dir] do
  recursive true
  action :delete
end

directory node[:fetch_server][:pid_dir] do
  recursive true
  action :delete
end

ruby_block 'fetch server nerve file cleanup' do
  block do
    nerve_list = Dir.glob("#{node[:nerve][:nerve_conf_dir]}/*#{node[:fetch_server][:service_config][:name]}*")
    nerve_list.each do |nerve_file|
       File.delete nerve_file
    end
  end
end
