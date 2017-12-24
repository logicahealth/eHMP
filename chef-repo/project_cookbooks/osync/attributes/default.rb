#
# Cookbook Name:: osync
# Recipe:: default
#

default['osync']['beanstalk_version'] = "1.10-2.el6"

default[:osync][:profile][:worker_count] = 1
default[:osync][:profile][:primary][:'admissions'][:worker_count] = node[:osync][:profile][:worker_count]
default[:osync][:profile][:primary][:'appointments'][:worker_count] = node[:osync][:profile][:worker_count]
default[:osync][:profile][:primary][:'sync'][:worker_count] = 6
default[:osync][:profile][:primary][:'patientlist'][:worker_count] = 4

# Logrotate configuration
default[:osync][:logrotate][:name] = 'osync_logs'
default[:osync][:logrotate][:log_directory] = '/var/log/osync/*.log'
default[:osync][:logrotate][:rotate] = 10
default[:osync][:logrotate][:options] = %w{missingok compress delaycompress copytruncate notifempty dateext}
default[:osync][:logrotate][:frequency] = 'daily'
default[:osync][:logrotate][:dateformat] = '-%Y%m%d%s'

# Opportunistic Sync (osync) Configuration
default[:osync][:user] = 'node'
default[:osync][:group] = 'node'
default[:osync][:source] = nil
default[:osync][:home] = '/opt/vxsync_client'
default[:osync][:config] = nil
default[:osync][:service] = 'osync'
default[:osync][:log_directory] = "/var/log/osync"
default[:osync][:log_level][:loggers] = {
  :root => "debug",
  :valid_patients => "debug",
  :results => "debug"
}
default[:osync][:config_file] = "#{node[:osync][:home]}/worker-config.json"
default[:osync][:bluepill_log_directory] = "#{node[:osync][:log_directory]}/bluepill"
default[:osync][:config_refresh] = 0
default[:osync][:max_file_size] = 2000000
default[:osync][:beanstalk_ttr] = 60
default[:osync][:mixedEnvironmentMode] = true
default[:osync][:client][:active_user_run][:enabled] = true
default[:osync][:client][:active_user_run][:minute] = '20'
default[:osync][:client][:active_user_run][:hour] = '0'
default[:osync][:client][:active_user_run][:weekday] = '*'
default[:osync][:client][:active_user_run][:log_file] = 'osync-active-user-list-run.log'
default[:osync][:client][:active_user_cleanup][:enabled] = true
default[:osync][:client][:active_user_cleanup][:minute] = '15'
default[:osync][:client][:active_user_cleanup][:hour] = '0'
default[:osync][:client][:active_user_cleanup][:weekday] = '*'
default[:osync][:client][:active_user_cleanup][:log_file] = 'osync-active-user-list-cleanup.log'

default[:osync][:prefetch] = {
  :enabled => true,
  :minute => '0',
  :hour => '*/6',
  :weekday => '*',
  :log_file => 'osync-prefetch-run.log'
}

default[:osync][:processes] = {
  :opportunistic_sync_jobrepo => {
    :template => "osync_job_repo.sh.erb",
    :config => {
      :port => 5001,
      :max_file_size => node[:osync][:max_file_size]
    }
  },
  :'osync-subscriber_host' => {
    :template => "osync_subscriber_host.sh.erb",
    :endpoint => "osync-subscriberHost.js",
    :config => {
      :profile => "primary"
    }
  }
}
default[:osync][:appointment_scheduling] = {}
default[:osync][:admissions] = {}
default[:osync][:uv_threadpool_size] = 4
