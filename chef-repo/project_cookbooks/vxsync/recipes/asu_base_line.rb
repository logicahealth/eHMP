# Cookbook Name:: vxsync
# Recipe:: asu_base_line
#

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
  )
  notifies :restart, "service[#{node[:asu][:service]}]"
end
