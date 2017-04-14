#
# Cookbook Name:: workstation
# Recipe:: chef_config
#

directory "#{node[:workstation][:user_home]}/Projects/vistacore" do
  owner node[:workstation][:user]
  mode "0755"
  recursive true
end

remote_directory "#{node[:workstation][:user_home]}/Projects/vistacore/.chef" do
  source ".chef"
  files_owner node[:workstation][:user]
  files_mode "0755"
  owner node[:workstation][:user]
  mode "0755"
end
