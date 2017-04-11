#
# Cookbook Name:: vxsync
# Recipe:: default
#

default[:vxsync][:filename] = 'vxsync.zip'
default[:vxsync][:artifact_path] = "#{Chef::Config['file_cache_path']}/#{node[:vxsync][:filename]}"
default[:vxsync][:home_dir] = '/opt/vxsync'
default[:vxsync][:service_name] = 'vxsync'
default[:vxsync][:log_directory] = "/var/log/vxsync"
default[:vxsync][:log_prefix] = "vxsync"
default[:vxsync][:log_ext] = ".log"
default[:vxsync][:log_pattern]="#{node[:vxsync][:log_directory]}/#{node[:vxsync][:log_prefix]}#{node[:vxsync][:log_ext]}"
default[:vxsync][:config_file] = "#{node[:vxsync][:home_dir]}/worker-config.json"
default[:vxsync][:persistence_dir] = "#{node[:vxsync][:home_dir]}/data"
default[:vxsync][:documents_dir] = "/var/vxsync/documents"
default[:vxsync][:bluepill_log_dir] = "#{node[:vxsync][:log_directory]}/bluepill"
default[:vxsync][:web_service_port] = 8080
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
default[:vxsync][:hdr_enabled] = true
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
    "siteHash" => "A8C2",
    "station_number" => 504
  }
]
default[:vxsync][:processes] = {
  :subscriber_primary => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "primary"
    },
  },
  :subscriber_jmeadows => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "jmeadows"
    },
  },
  :subscriber_hdr => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "hdr"
    },
  },
  :subscriber_vler => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "vler"
    },
  },
  :subscriber_pgd => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "pgd"
    },
  },
  :subscriber_document => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "document"
    },
  },
  :subscriber_storage => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "storage"
    },
    :number_of_copies => 3
  },
  :subscriber_enrichment => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "enrichment"
    },
  },
  :subscriber_prioritization =>
  {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "prioritization"
    },
  },
  :subscriber_publish => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "publish"
    },
  },
  :subscriber_error => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "error"
    },
  },
  :subscriber_vistaProcessor =>
  {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "vistaProcessor"
    },
  },
  :subscriber_vistahdr => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "vistahdr"
    },
  },
  :subscriber_resync => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "resync"
    },
  },
  :error_processor => {
    :template => "error_processor_host.sh.erb",
    :config => {
    },
  },
  :'sync-request-endpoint' => {
    :template => "sync_request_endpoint.sh.erb",
    :config => {
      :port => 8080
    },
  },
  :'writeback-endpoint' => {
    :template => "writeback_endpoint.sh.erb",
    :config => {
      :port => 9090
    },
  },
  :unsync => {
    :template => "unsync.sh.erb",
    :config => {
      :port => 8091
    },
  },
  :'admin-endpoint' => {
    :template => "admin_endpoint.sh.erb",
    :config => {
      :port => 9999
    },
  }
}

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
    :version => '1.UMLS2014AB.20141010',
    :dir_name => 'jlv'
  },
  :lncdb => {
    :version => '1.UMLS2014AB.20141010',
    :dir_name => 'lncdb'
  }
}

############################################
# osync
############################################
default[:osync][:source] = nil
default[:osync][:home] = "#{node[:vxsync][:home_dir]}"
default[:osync][:config] = nil
default[:osync][:service] = 'osync'
default[:osync][:log_directory] = "/var/log/osync"
default[:osync][:config_file] = "#{node[:osync][:home]}/worker-config.json"
default[:osync][:bluepill_log_directory] = "#{node[:osync][:log_directory]}/bluepill"
default[:osync][:config_refresh] = 0
default[:osync][:max_file_size] = 2000000
default[:osync][:beanstalk_ttr] = 60
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
