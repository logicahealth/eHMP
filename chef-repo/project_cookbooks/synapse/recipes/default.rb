#
# Cookbook Name:: synapse
# Recipe:: default
#

user node['synapse']['user'] do
  home    node['synapse']['home']
  shell   '/sbin/nologin'
  system  true
end

directory node['synapse']['home'] do
  owner     node['synapse']['user']
  group     node['synapse']['user']
  recursive true
end

directory node['synapse']['install_dir'] do
  owner     node['synapse']['user']
  group     node['synapse']['user']
  recursive true
end

template node['synapse']['config_file'] do
  variables(
    services: node['synapse']['services'],
    hosts: node['synapse']['zk_hosts'],
    haproxy: node['synapse']['haproxy']
  )
  owner node['synapse']['user']
  group node['synapse']['user']
  notifies :restart, 'service[synapse]'
end

include_recipe 'build-essential'

yum_package 'haproxy' do
  version node['synapse']['haproxy']['version']
end

gem_package 'synapse' do
  version node['synapse']['version']
  options("--install-dir #{node['synapse']['install_dir']}")
  notifies :restart, 'service[synapse]'
  not_if "GEM_HOME=#{node['synapse']['install_dir']} gem list synapse -i -v #{node['synapse']['version']}"
end

template '/etc/init.d/synapse' do
  variables(
    deploy_path: node['synapse']['install_dir'],
    user: node['synapse']['user'],
    executable: node['synapse']['executable'],
    config_file: node['synapse']['config_file'],
    gem_home: node['synapse']['install_dir']
  )
  source 'synapse.init.erb'
  mode 0755
  notifies :restart, 'service[synapse]'
end

service 'synapse' do
  action :enable
  supports status: true, start: true, stop: true, restart: true
end
