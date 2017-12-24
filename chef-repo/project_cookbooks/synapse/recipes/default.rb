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

logrotate_app 'synapse' do
  path node['synapse']['logrotate']['path']
  options node['synapse']['logrotate']['options']
  enable true
  rotate node['synapse']['logrotate']['rotate']
  frequency node['synapse']['logrotate']['frequency']
  dateformat node['synapse']['logrotate']['dateformat']
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

execute 'stop-systemv-style-synapse' do
  command '/sbin/service synapse stop'
  notifies :delete, 'file[/etc/init.d/synapse]'
  only_if {File.exist?('/etc/init.d/synapse')}
end

file '/etc/init.d/synapse' do
  action :nothing
end

template '/etc/init/synapse.conf' do
  variables(
    deploy_path: node['synapse']['install_dir'],
    user: node['synapse']['user'],
    executable: node['synapse']['executable'],
    config_file: node['synapse']['config_file'],
    gem_home: node['synapse']['install_dir']
  )
  source 'synapse.conf.erb'
  notifies :stop, 'service[synapse]', :before
  notifies :start, 'service[synapse]'
end

service 'synapse' do
  provider Chef::Provider::Service::Upstart
  action :enable
end
