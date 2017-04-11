#
# Cookbook Name:: chef-repo-provision
# Recipe:: centos-6-local
#

require 'chef/provisioning/vagrant_driver'
with_driver 'vagrant'
 
vagrant_box 'opscode-centos-6.5' do
  url "#{node[:common][:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/opscode/centos/6.5/centos-6.5-provisionerless.box"
end

osx_opts = {}
osx_opts[:box_name] = 'opscode-centos-6.5'
osx_opts[:network] = {
  :network_type => node[:machine][:network_type],
  :ip_address => "10.2.2.77"
}
osx_opts[:provider_config] = {
  :provider_name => node[:machine][:provider_name],
  :instance_name => "centos-6-#{node[:machine][:stack]}",
  :memory => 1024
}

machine "centos-6-#{node[:machine][:stack]}" do
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
