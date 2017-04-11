#
# Cookbook Name:: osync
# Recipe:: deploy_osync
#

require 'fileutils'

directory node[:osync][:home] do
  owner  'root'
  group  'root'
  mode "0755"
  recursive true
  action :create
end

execute "install_osync_modules" do
  cwd node[:osync][:home]
  command "npm install"
  action :nothing
end

trigger_resources = []

directory "#{node[:osync][:log_directory]}" do
  owner 'root'
  group 'root'
  mode '0755'
  action :create
end

directory "#{node[:osync][:bluepill_log_directory]}" do
  owner  'root'
  group  'root'
  mode "0755"
  action :create
end

node[:osync][:processes].each{ |name, process_block|
  trigger_resources << template("#{node[:osync][:home]}/#{name}.sh") do
    source process_block[:template]
    variables(
      :name => name,
      :options => process_block[:config],
      :endpoint => process_block[:endpoint],
      :process_log => "#{node[:osync][:log_directory]}/#{name}.log"
    )
    owner 'root'
    group 'root'
    mode '0755'
  end
}

trigger_resources << template("/etc/init/osync.conf") do
  variables(
    :name => "osync",
    :level => 2346
  )
  source 'upstart-bluepill.erb'
end

trigger_resources << template("/etc/bluepill/osync.pill") do
  source 'osync_bluepill.pill.erb'
  variables(
    :name => "osync",
    :processes => node[:osync][:processes],
    :working_directory => node[:osync][:home],
    :log_directory => node[:osync][:bluepill_log_directory]
  )
end 

service node[:osync][:service] do
  provider Chef::Provider::Service::Upstart
  restart_command "/sbin/stop #{node[:osync][:service]}; /sbin/start #{node[:osync][:service]}"
  action [:enable, :start]
end
