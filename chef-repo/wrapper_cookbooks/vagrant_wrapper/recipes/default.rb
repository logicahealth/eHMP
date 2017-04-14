#
# Cookbook Name:: vagrant_wrapper
# Recipe:: default
#

node.normal[:vagrant][:version]     = '1.8.6'
node.normal[:vagrant][:url]         = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/vagrant/vagrant/#{node[:vagrant][:version]}/vagrant-#{node[:vagrant][:version]}.dmg"
node.normal[:vagrant][:checksum]    = "b916cd103c91faf57b63b49188e4cd09136f81385ff05d62e55b68c87b53a2d9"


include_recipe "vagrant_wrapper::upgrade" if !`which vagrant`.empty? && !`vagrant -v`.include?(node.normal[:vagrant][:version])
include_recipe "vagrant"

#Install Centos Base box because new version of vagrant breaks if no box exist with in vagrant home during deploy
box_name = "opscode-centos-6.5"
box_url = "#{node[:common][:nexus_url]}/repositories/filerepo/third-party/program/opscode/centos/6.5/centos-6.5-provisionerless.box"
execute 'install base box' do
  environment 'VAGRANT_HOME' => node[:vagrant_wrapper][:home]
  command "vagrant box add #{box_name} #{box_url}"
  only_if {!Dir.exists?("#{node[:vagrant_wrapper][:home]}/boxes") || (Dir.entries("#{node[:vagrant_wrapper][:home]}/boxes") - %w{ . .. .DS_Store }).empty? || !Dir.exists?("#{node[:vagrant_wrapper][:home]}/boxes/#{box_name}")}
end

#correct ownership for new vagrant home or when box path are fixed
execute "correct ownership of vagrant home" do
  command "chown -R #{node[:workstation][:user]} #{node[:vagrant_wrapper][:home]}"
  only_if {Dir.exists?(node[:vagrant_wrapper][:home])}
end
