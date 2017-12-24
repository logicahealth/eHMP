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
  mode '0755'
  recursive true
end

directory node['nerve']['install_dir'] do
  owner     node['nerve']['user']
  group     node['nerve']['user']
  mode '0755'
  recursive true
end

directory node['nerve']['nerve_conf_dir'] do
  owner     node['nerve']['user']
  group     node['nerve']['user']
  mode '0755'
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
  mode 0755
  notifies :restart, 'service[nerve]'
end

logrotate_app 'nerve' do
  path node['nerve']['logrotate']['path']
  options node['nerve']['logrotate']['options']
  enable true
  rotate node['nerve']['logrotate']['rotate']
  frequency node['nerve']['logrotate']['frequency']
  dateformat node['nerve']['logrotate']['dateformat']
end

include_recipe 'build-essential'

gem_package 'nerve' do
  version node['nerve']['version']
  options("--install-dir #{node['nerve']['install_dir']}")
  notifies :restart, 'service[nerve]'
  not_if "GEM_HOME=#{node['nerve']['install_dir']} gem list nerve -i -v #{node['nerve']['version']}"
end

execute "#{node['nerve']['install_dir']} ownership correction" do
  command "chown -R #{node['nerve']['user']}:#{node['nerve']['user']} #{node['nerve']['install_dir']}"
  action :run
  only_if "ls -l #{node['nerve']['install_dir']}|awk \'{print $3}\'| grep root"
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
