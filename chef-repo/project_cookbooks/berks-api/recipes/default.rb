#
# Cookbook Name:: berks-api
# Recipe:: default
#

execute "install development packages" do
  command 'yum -y groupinstall "Development Tools"'
end

package "libarchive-devel"

gem_package "hashie" do
  gem_binary node[:'berks-api'][:gem_binary]
  version "2.1.0"
end

gem_package "http" do
  gem_binary node[:'berks-api'][:gem_binary]
  version "0.9.8"
end

gem_package "berkshelf-api" do
  gem_binary node[:'berks-api'][:gem_binary]
  version "2.2.0"
end

directory "/root/.berkshelf/api-server" do
  recursive true
end

template "/root/.berkshelf/api-server/config.json" do
  variables(:chef_server_url => node[:'berks-api'][:chef_server_url])
end

template "/etc/init.d/berks-api" do
  variables(:berks_api_install_dir => node[:'berks-api'][:berks_api_install_dir])
  owner "root"
  group "root"
  mode "0755"
end

service "berks-api" do
  action [:enable, :restart]
end

berks_api_wait_for_connection "berks-api to be available" do
  url node[:'berks-api'][:berkshelf_api_url]
  notifies :stop, "service[berks-api]", :immediately
  notifies :disable, "service[berks-api]", :immediately
end

sudo "jenkins" do
  user      "jenkins"
  commands  [
    "/sbin/service berks-api start",
    "/sbin/service berks-api stop",
    "/sbin/service berks-api restart"
  ]
  nopasswd true
end
