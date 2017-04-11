#
# Cookbook Name:: vxsync
# Recipe:: default
#

default[:vxsync][:force_reset] = false
default[:vxsync][:filename] = 'vxsync.zip'
default[:vxsync][:artifact_path] = "#{Chef::Config['file_cache_path']}/#{node[:vxsync][:filename]}"
default[:vxsync][:home_dir] = '/opt/vxsync'
default[:vxsync][:service_name] = 'vxsync'
default[:vxsync][:log_directory] = "/var/log/vxsync"
default[:vxsync][:config_file] = "#{node[:vxsync][:home_dir]}/worker-config.json"
default[:vxsync][:persistence_dir] = "#{node[:vxsync][:home_dir]}/data"
default[:vxsync][:documents_dir] = "/var/vxsync/documents"
default[:vxsync][:bluepill_log_dir] = "#{node[:vxsync][:log_directory]}/bluepill"
default[:vxsync][:beanstalk_processes] = {
:jobrepo => {
    :template => "job_repo.sh.erb",
    :config => {
      :port => 5000,
      :max_file_size => 20000000
    },
  },
}
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

default[:terminology][:nexus_base_url] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/gov/va/hmp/termdb"
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
# asu
############################################
default[:asu][:source] = nil # options the uri should be either https://some.thing.com/stuff... or file:///path/to/artifact.ext
default[:asu][:filename] = "asu"
default[:asu][:artifact_path] = "#{Chef::Config['file_cache_path']}/#{node[:asu][:filename]}.zip"
default[:asu][:checksum] = nil
#default[:asu][:service] = "#{node[:asu][:filename]}"
default[:asu][:service] = "asu_server"
default[:asu][:home_dir] = "/opt/#{node[:asu][:service]}"
default[:asu][:log_dir] = "#{node[:asu][:home_dir]}/logs"
default[:asu][:config_dir] = "#{node[:asu][:home_dir]}/config"
default[:asu][:server_port] = "9000"
default[:asu][:refresh_interval] = "60000"
default[:asu][:jds_ip] = nil
default[:asu][:vxsync_ip] = nil
default[:asu][:jds_port] = nil


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
default[:osync][:processes] = {
  :opportunistic_sync_jobrepo => {
    :template => "osync_job_repo.sh.erb",
    :config => {
      :port => 5001,
      :max_file_size => 2000000
    }
  },
  :opportunistic_sync_endpoint => {
    :template => "osync_process.sh.erb",
    :endpoint => "osync-core/opportunistic-sync/opportunistic-sync.js",
    :config => {
      :port => 8090,
      :max_file_size => 2000000
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
      :port => 8810,
      :max_file_size => 2000000
    }
  }
}
