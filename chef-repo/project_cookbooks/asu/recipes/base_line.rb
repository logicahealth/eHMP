#
# Cookbook Name:: asu
# Recipe:: base_line
#

user node['asu']['user']

group node['asu']['group'] do
  members node['asu']['user']
  action :create
end

include_recipe 'bluepill_wrapper'

template "/etc/init/#{node[:asu][:service]}.conf" do
  variables(
    :name => node[:asu][:service],
    :level => 2346
  )
  source 'upstart-bluepill.erb'
  notifies :restart, "service[#{node[:asu][:service]}]"
end

template "/etc/bluepill/#{node[:asu][:service]}.pill" do
  source 'bluepill-asu.pill.erb'
  variables(
    :name => node[:asu][:service],
    :working_directory => node[:asu][:home_dir],
    :log_directory => node[:asu][:log_dir],
    :pid_directory => node[:asu][:pid_dir],
    :base_directory => node[:asu][:base_dir],
    :user => node['asu']['user'],
    :group => node['asu']['group']
  )
  notifies :stop, "service[#{node[:asu][:service]}]", :before
  notifies :restart, "service[#{node[:asu][:service]}]"
end
