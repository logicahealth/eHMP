#
# Cookbook Name:: workstation
# Recipe:: workspace_scripts
#

cookbook_file "#{node[:workstation][:user_home]}/Projects/vistacore/clone_repo.sh" do
  source "clone_repo.sh"
  owner node[:workstation][:user]
  mode "0755"
end

template "#{node[:workstation][:user_home]}/Projects/vistacore/configure_workspace.sh" do
  source "configure_workspace.erb"
  mode "0755"
end

cookbook_file "#{node[:workstation][:user_home]}/Projects/vistacore/vms.sh" do
  source "vms.sh"
  owner node[:workstation][:user]
  mode "0755"
end

cookbook_file "#{node[:workstation][:user_home]}/Projects/vistacore/Rakefile" do
  source "Rakefile"
  owner node[:workstation][:user]
  mode "0755"
end
