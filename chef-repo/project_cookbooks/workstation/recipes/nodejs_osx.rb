#
# Cookbook Name:: workstation
# Recipe:: nodejs_osx
#
node.default[:workstation][:nodejs_osx][:source] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/nodejs/node/#{node[:workstation][:nodejs_osx][:version]}/node-#{node[:workstation][:nodejs_osx][:version]}.pkg"


remote_file "#{Chef::Config[:file_cache_path]}/node-#{node[:workstation][:nodejs_osx][:version]}.pkg" do
  source node[:workstation][:nodejs_osx][:source]
  action :create_if_missing
end

execute "install_nodejs_package" do
  command "installer -pkg #{Chef::Config[:file_cache_path]}/node-#{node[:workstation][:nodejs_osx][:version]}.pkg -target /"
  not_if "node --version 2> /dev/null | grep #{node[:workstation][:nodejs_osx][:version]}"
end

execute "add nexus registry" do
  command "npm config set registry #{node[:workstation][:nodejs_osx][:nexus_url]}/nexus/content/repositories/npm-all/"
end
