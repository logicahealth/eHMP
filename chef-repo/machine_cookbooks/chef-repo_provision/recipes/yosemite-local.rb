#
# Cookbook Name:: workstation
# Recipe:: yosemite
#

require 'chef/provisioning/vagrant_driver'
with_driver 'vagrant'
 
vagrant_box 'osx-10.10.1' do
  url "#{node[:common][:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/vagrant/basebox/osx/10.10.1/osx-10.10.1.box"
end

osx_opts = {}
osx_opts[:box_name] = 'osx-10.10.1'
osx_opts[:network] = {
  :network_type => node[:machine][:network_type],
  :ip_address => "IP       "
}
osx_opts[:provider_config] = {
  :provider_name => node[:machine][:provider_name],
  :instance_name => "yosemite-#{node[:machine][:stack]}",
  :memory => 2048,
  :gui => true,
  :is_osx => true
}
osx_opts[:synced_folders] = [
  {
    :host_path => ".",
    :guest_path => "/vagrant",
    :disabled => true
  }
]

machine "yosemite-#{node[:machine][:stack]}" do
  machine_options[:vagrant_config] = vagrant_config(osx_opts)
  converge node[:machine][:converge]
  file node[:machine][:cert_file][:guest_path], node[:machine][:cert_file][:host_path]
  file "/Users/vagrant/Projects/vistacore/.chef/knife.rb", "#{ENV['HOME']}/Projects/vistacore/.chef/knife.rb"
  chef_environment node[:machine][:environment]
  attributes(
    stack: node[:machine][:stack],
    nexus_url: node[:common][:nexus_url],
    data_bag_string: node[:common][:data_bag_string]
  )
  role 'workstation'
  action node[:machine][:action]
end
