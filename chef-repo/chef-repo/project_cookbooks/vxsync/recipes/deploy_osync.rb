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
  action [:enable]
end

node[:osync][:appointment_scheduling].each{ |site_id, cron_config|
  cron "osync_appointment_scheduling - #{site_id}" do
    minute cron_config[:minute]
    hour cron_config[:hour]
    weekday cron_config[:weekday]
    command "cd #{node[:osync][:home]}; /usr/local/bin/node ./tools/osync/osync-clinic-run.js --site #{site_id} >> #{node[:osync][:log_directory]}/#{cron_config[:log_file]}"
    action cron_config[:enabled] ? :create : :delete
  end
}

node[:osync][:admissions].each{ |site_id, cron_config|
  cron "osync_admissions_#{site_id}" do
    minute cron_config[:minute]
    hour cron_config[:hour]
    weekday cron_config[:weekday]
    command "cd #{node[:osync][:home]}; /usr/local/bin/node ./tools/osync/osync-admission-run.js --site #{site_id} >> #{node[:osync][:log_directory]}/#{cron_config[:log_file]}"
    action cron_config[:enabled] ? :create : :delete
  end
}

cron "active_user_run" do
  minute node[:osync][:client][:active_user_run][:minute]
  hour node[:osync][:client][:active_user_run][:hour]
  weekday node[:osync][:client][:active_user_run][:weekday]
  command "cd #{node[:osync][:home]}; /usr/local/bin/node ./tools/osync/osync-active-user-list-run.js --force >> #{node[:osync][:log_directory]}/#{node[:osync][:client][:active_user_run][:log_file]}"
  action node[:osync][:client][:active_user_run][:enabled] ? :create : :delete
end

cron "active_user_cleanup" do
  minute node[:osync][:client][:active_user_cleanup][:minute]
  hour node[:osync][:client][:active_user_cleanup][:hour]
  weekday node[:osync][:client][:active_user_cleanup][:weekday]
  command "cd #{node[:osync][:home]}; /usr/local/bin/node ./tools/osync/active-user-cleanup-run.js --force >> #{node[:osync][:log_directory]}/#{node[:osync][:client][:active_user_cleanup][:log_file]}"
  action node[:osync][:client][:active_user_cleanup][:enabled] ? :create : :delete
end
