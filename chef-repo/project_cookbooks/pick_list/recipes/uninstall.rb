#
# Cookbook Name:: pick_list
# Recipe:: uninstall
#

service "#{node[:pick_list][:service_config][:name]} uninstall" do
  service_name node[:pick_list][:service_config][:name]
  provider Chef::Provider::Service::Upstart
  action [:disable, :stop]
  only_if { File.exists?("/etc/bluepill/#{node[:pick_list][:service_config][:name]}.pill") }
end

file "/etc/bluepill/#{node[:pick_list][:service_config][:name]}.pill" do
  action :delete
  only_if { Dir.exists?('/etc/bluepill') }
end

directory node[:pick_list][:home_dir] do
  recursive true
  action :delete
end

directory node[:pick_list][:pid_dir] do
  recursive true
  action :delete
end

ruby_block 'pick list nerve file cleanup' do
  block do
    nerve_list = Dir.glob("#{node[:nerve][:nerve_conf_dir]}/*#{node[:pick_list][:service_config][:name]}*")
    nerve_list.each do |nerve_file|
       File.delete nerve_file
    end
  end
end
