#
# Cookbook Name:: pick_list
# Recipe:: service
#

# Iterate over every service
config = node[:pick_list][:service_config]

# Create a template for upstart
template "/etc/init/#{config[:name]}.conf" do
  variables(
    :name => config[:name],
    :level =>  config[:service_run_level],
    :deploy_path => config[:deploy_path]
  )
  source "#{config[:service_template_source]}"
  notifies :stop, "service[#{config[:name]}]", :before
end

# Fix for owner and group
file "/etc/init/#{config[:name]}.conf" do
  owner 'root'
  group 'root'
  notifies :restart, "service[#{config[:name]}]"
end

#Create a template for bluepill
template "/etc/bluepill/#{config[:name]}.pill" do
  source config[:bluepill_template_source]
  variables(
    :name => config[:name],
    :working_directory => node[:pick_list][:home_dir],
    :deploy_path => config[:deploy_path],
    :config_file => config[:destination],
    :max_old_space => config[:max_old_space],
    :port => config[:port],
    :dev_deploy => node[:dev_deploy] || false,
    :debug_port => config[:debug_port],
    :processes => config[:processes],
    :log_directory => node[:pick_list][:log_dir],
    :pid_directory => node[:pick_list][:pid_dir],
    :tls_reject_unauthorized => node[:pick_list][:tls_reject_unauthorized],
    :uv_threadpool_size => node[:pick_list][:uv_threadpool_size],
    :apm_deploy => node[:pick_list][:enable_apm],
    :app_dynamics_deploy => node[:pick_list][:enable_app_dynamics],
    :user => node[:pick_list][:user],
    :group => node[:pick_list][:group]
  )
  notifies :stop, "service[#{config[:name]}]", :before
  notifies :restart, "service[#{config[:name]}]"
end

# Define service to be enabled on restart of instance
service "#{config[:name]}" do
  provider Chef::Provider::Service::Upstart
  restart_command "/sbin/stop #{config[:name]}; /sbin/start #{config[:name]}"
  action :enable
end
