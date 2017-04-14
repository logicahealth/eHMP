#
# Cookbook Name:: workstation
# Recipe:: slave_config
#

directory "#{node[:workstation][:user_home]}/Projects/vistacore" do
  owner node[:workstation][:user]
  mode "0755"
  recursive true
end

remote_directory "#{node[:workstation][:user_home]}/Projects/vistacore/.chef" do
  source "slave/.chef"
  files_owner node[:workstation][:user]
  files_mode "0755"
  owner node[:workstation][:user]
  mode "0755"
end

directory "#{node[:workstation][:user_home]}/Projects/vistacore/.chef/keys" do
  owner node[:workstation][:user]
  mode "0755"
end

file "#{node[:workstation][:user_home]}/Projects/vistacore/.chef/jenkins.pem" do
	content lazy{ File.read("/jenkins.pem") }
  owner node[:workstation][:user]
  mode "0755"
  sensitive true
  action :create
end

chef_users = ChefVault::Item.load(
  "jenkins", "chef_users",
  node_name: 'jenkins',
  client_key_path: "/jenkins.pem"
).to_hash

chef_users["chef_users"].each_pair { |key_name, key_content|
  file "#{ENV['WORKSPACE']}/.chef/#{key_name}.pem" do
    action :create
    content key_content
    owner node[:workstation][:user]
    mode '0755'
  end
}

ssh = ChefVault::Item.load(
  "jenkins", "ssh",
  node_name: 'jenkins',
  client_key_path: "/jenkins.pem"
).to_hash

ssh["keys"].each_pair { |key_name, key_content|
  file "#{ENV['WORKSPACE']}/.chef/keys/#{key_name}" do
    action :create
    content key_content
    owner node[:workstation][:user]
    group node[:workstation][:user]
    mode '0600'
  end
}
