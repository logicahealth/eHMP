#
# Cookbook Name:: vxsync
# Recipe:: default
#

default[:vxsync][:start_vxsync_services] = true
default[:vxsync][:filename] = 'vxsync.zip'
default[:vxsync][:artifact_path] = "#{Chef::Config['file_cache_path']}/#{node[:vxsync][:filename]}"
default[:vxsync][:web_service_port] = 8080
default[:vxsync][:endpoint_max_sockets] = 5
default[:vxsync][:config_refresh] = 60000
default[:vxsync][:max_file_size] = 20000000
default[:vxsync][:beanstalk_ttr] = 120
default[:vxsync][:beanstalk_version] = "1.10-2.el6"
default[:vxsync][:beanstalk_priority] = 10
default[:vxsync][:beanstalk_delay] = 0
default[:vxsync][:beanstalk_timeout] = 10
default[:vxsync][:beanstalk_init_millis] = 1000
default[:vxsync][:beanstalk_max_millis] = 15000
default[:vxsync][:beanstalk_inc_millis] = 1000
default[:vxsync][:beanstalk_processes] = {
  :jobrepo => {
    :template => "job_repo.sh.erb",
    :config => {
      :port => 5000,
      :tube_name => "vx-sync",
      :tube_prefix => "vxs-",
      :job_type => "true",
      :max_file_size => node[:vxsync][:max_file_size]
    }
  }
}
default[:vxsync][:ods_attempts] = 10
default[:vxsync][:ods_delay] = 30
default[:vxsync][:site_list] = ["9E7A", "C877"]
default[:vxsync][:hdr_enabled] = true
default[:vxsync][:hdr_mode] = "REQ/RES"
default[:vxsync][:jmeadows_enabled] = true
default[:vxsync][:vler_enabled] = true
default[:vxsync][:publish_tubes]=true
default[:vxsync][:jmeadows_timeout] = 60000
default[:vxsync][:vler_timeout] = 60000
default[:vxsync][:hdr_timeout] = 60000
default[:vxsync][:mvi_timeout] = 60000
default[:vxsync][:terminology_timeout] = 60000
default[:vxsync][:jds_timeout] = 300000
default[:vxsync][:hdr_blacklist_sites] = [
  {
    "site_hash" => "2927",
    "station_number" => 202
  },
  {
    "site_hash" => "A8C2",
    "station_number" => 504
  }
]
default[:vxsync][:vxsync_applications] = ["client", "vista"]
default[:vxsync][:clear_logs] = nil

default[:soap_handler][:filename] = 'soap_handler.jar'
default[:soap_handler][:artifact_path] = "#{Chef::Config['file_cache_path']}/#{node[:soap_handler][:filename]}"
default[:soap_handler][:home_dir] = '/opt/soap_handler'
default[:soap_handler][:service_name] = 'soap_handler'
default[:soap_handler][:config_file] = "#{node[:soap_handler][:home_dir]}/config.json"

default[:soap_handler][:security][:trust_store] = nil
default[:soap_handler][:security][:trust_store_pw] = nil
default[:soap_handler][:security][:key_store] = nil
default[:soap_handler][:security][:key_store_pw] = nil

default[:soap_handler][:server_port] = "5400"
default[:soap_handler][:admin_port] = "5401"

default[:terminology][:nexus_base_url] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/gov/va/hmp/termdb"
default[:terminology][:home_dir] = '/opt/terminology'
default[:terminology][:artifacts] = {
  :drugdb => {
    :version => '1.UMLS2014AB.20141010',
    :dir_name => 'drug'
  },
  :jlvdb => {
    :version => '1.1',
    :dir_name => 'jlv'
  },
  :lncdb => {
    :version => '1.UMLS2014AB.20141010',
    :dir_name => 'lncdb'
  }
}

############################################
# error-processing
############################################
default[:error_processing][:jdsGetErrorLimit] = 1000
default[:error_processing][:profiles][:catastrophic_recovery][:enabled] = false
default[:error_processing][:profiles][:record_enrichment][:enabled] = false
default[:error_processing][:profiles][:activity_management][:enabled] = false
default[:error_processing][:profiles][:jmeadows][:enabled] = false
default[:error_processing][:profiles][:hdr][:enabled] = false
default[:error_processing][:profiles][:vler][:enabled] = false
default[:error_processing][:profiles][:pgd][:enabled] = false

############################################
# osync
############################################
default[:osync][:source] = nil
default[:osync][:home] = '/opt/vxsync_client'
default[:osync][:config] = nil
default[:osync][:service] = 'osync'
default[:osync][:log_directory] = "/var/log/osync"
default[:osync][:config_file] = "#{node[:osync][:home]}/worker-config.json"
default[:osync][:bluepill_log_directory] = "#{node[:osync][:log_directory]}/bluepill"
default[:osync][:config_refresh] = 0
default[:osync][:max_file_size] = 2000000
default[:osync][:beanstalk_ttr] = 60
default[:osync][:mixedEnvironmentMode] = true
default[:osync][:processes] = {
  :opportunistic_sync_jobrepo => {
    :template => "osync_job_repo.sh.erb",
    :config => {
      :port => 5001,
      :max_file_size => node[:osync][:max_file_size]
    }
  },
  :opportunistic_sync_endpoint => {
    :template => "osync_process.sh.erb",
    :endpoint => "osync-core/opportunistic-sync/opportunistic-sync.js",
    :config => {
      :port => 8090,
      :max_file_size => node[:osync][:max_file_size]
    }
  },
  :'osync-subscriber_host' => {
    :template => "osync_subscriber_host.sh.erb",
    :endpoint => "osync-subscriberHost.js",
    :config => {
      :profile => "primary"
    }
  },
  :'osync-appointment_scheduler' => {
    :template => "osync_process.sh.erb",
    :endpoint => "osync-core/appointment-scheduler/appointment-scheduler.js",
    :config => {
      :port => 8770,
      :max_file_size => node[:osync][:max_file_size]
    }
  }
}
