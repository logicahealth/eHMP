#
# Cookbook Name:: rdk
# Recipe:: service
#

# Iterate over every service
node[:rdk][:services].each do |name, config|

  # Create a template for upstart
  template "/etc/init/#{config[:service]}.conf" do
    variables(
      :name => config[:service],
      :level =>  config[:service_run_level],
      :deploy_path => config[:deploy_path]
    )
    source "#{config[:service_template_source]}"
    notifies :stop, "service[#{config[:service]}]", :before
    notifies :restart, "service[#{config[:service]}]"
  end

  #Create a template for bluepill
  template "/etc/bluepill/#{config[:service]}.pill" do
    source config[:bluepill_template_source]
    variables(
      :name => config[:service],
      :working_directory => node[:rdk][:home_dir],
      :deploy_path => config[:deploy_path],
      :config_file => config[:config_destination],
      :max_old_space => config[:max_old_space],
      :port => config[:port],
      :dev_deploy => node[:rdk][:dev_deploy] || false,
      :debug_port => config[:debug_port],
      :processes => config[:processes],
      :log_directory => node[:rdk][:log_dir],
      :pid_directory => node[:rdk][:pid_dir],
      :tls_reject_unauthorized => node[:rdk][:tls_reject_unauthorized]
    )
    notifies :stop, "service[#{config[:service]}]", :before
    notifies :restart, "service[#{config[:service]}]"
  end

  # Define service to be enabled on restart of instance
  service "#{config[:service]}" do
    provider Chef::Provider::Service::Upstart
    restart_command "/sbin/stop #{config[:service]}; /sbin/start #{config[:service]}"
    action :enable
  end
end
