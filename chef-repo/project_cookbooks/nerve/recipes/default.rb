#
# Cookbook Name:: nerve
# Recipe:: default
#

user node['nerve']['user'] do
  home    node['nerve']['home']
  shell   '/sbin/nologin'
  system  true
end

directory node['nerve']['home'] do
  owner     node['nerve']['user']
  group     node['nerve']['user']
  recursive true
end

directory node['nerve']['install_dir'] do
  owner     node['nerve']['user']
  group     node['nerve']['user']
  recursive true
end

directory node['nerve']['nerve_conf_dir'] do
  owner     node['nerve']['user']
  group     node['nerve']['user']
  recursive true
end

template node['nerve']['config_file'] do
  cookbook "nerve"
  variables(
    instance_id: node['hostname'],
    service_conf_dir: node['nerve']['nerve_conf_dir']
  )
  owner node['nerve']['user']
  group node['nerve']['user']
  notifies :restart, 'service[nerve]'
end

include_recipe 'build-essential'

gem_package 'nerve' do
  version node['nerve']['version']
  options("--install-dir #{node['nerve']['install_dir']}")
  notifies :restart, 'service[nerve]'
  not_if "GEM_HOME=#{node['nerve']['install_dir']} gem list nerve -i -v #{node['nerve']['version']}"
end

template '/etc/init.d/nerve' do
  cookbook "nerve"
  variables(
    deploy_path: node['nerve']['install_dir'],
    user: node['nerve']['user'],
    executable: node['nerve']['executable'],
    config_file: node['nerve']['config_file'],
    gem_home: node['nerve']['install_dir']
  )
  source 'nerve.init.erb'
  mode 0755
  notifies :restart, 'service[nerve]'
end

service 'nerve' do
  action :enable
  supports status: true, start: true, stop: true, restart: true
end
