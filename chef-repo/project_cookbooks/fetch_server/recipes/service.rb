#
# Cookbook Name:: fetch_server
# Recipe:: service
#

# Iterate over every service
config = node[:fetch_server][:service_config]

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
    :working_directory => node[:fetch_server][:home_dir],
    :deploy_path => config[:deploy_path],
    :config_file => config[:destination],
    :max_old_space => config[:max_old_space],
    :port => config[:port],
    :dev_deploy => node[:dev_deploy] || false,
    :debug_port => config[:debug_port],
    :processes => config[:processes],
    :log_directory => node[:fetch_server][:log_dir],
    :pid_directory => node[:fetch_server][:pid_dir],
    :tls_reject_unauthorized => node[:fetch_server][:tls_reject_unauthorized],
    :uv_threadpool_size => node[:fetch_server][:uv_threadpool_size],
    :apm_deploy => node[:fetch_server][:enable_apm],
    :app_dynamics_deploy => node[:fetch_server][:enable_app_dynamics],
    :user => node[:fetch_server][:user],
    :group => node[:fetch_server][:group]
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
