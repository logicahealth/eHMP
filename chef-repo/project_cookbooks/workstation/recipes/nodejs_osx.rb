#
# Cookbook Name:: workstation
# Recipe:: nodejs_osx
#

remote_file node[:workstation][:nodejs_osx][:path] do
  source node[:workstation][:nodejs_osx][:source]
  action :create_if_missing
end

execute "install_nodejs_package" do
  command "installer -pkg #{node[:workstation][:nodejs_osx][:path]} -target /"
  not_if "node --version 2> /dev/null | grep #{node[:workstation][:nodejs_osx][:version]}"
end

