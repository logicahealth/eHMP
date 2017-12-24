#
# Cookbook Name:: vxsync
# Attributes:: vxsync_client
#

default[:vxsync_client][:home_dir] = '/opt/vxsync_client'
default[:vxsync_client][:service_name] = 'vxsync_client'
default[:vxsync_client][:log_directory] = "/var/log/vxsync"
default[:vxsync_client][:log_prefix] = "vxsync"
default[:vxsync_client][:log_ext] = ".log"
default[:vxsync_client][:log_pattern] = "#{node[:vxsync_client][:log_directory]}/#{node[:vxsync_client][:log_prefix]}#{node[:vxsync_client][:log_ext]}"
default[:vxsync_client][:config_file] = "#{node[:vxsync_client][:home_dir]}/worker-config.json"
default[:vxsync_client][:data_dir] = '/var/vxsync'
default[:vxsync_client][:documents_dir] = "#{node[:vxsync_client][:data_dir]}/documents"
default[:vxsync_client][:persistence_dir] = "#{node[:vxsync_client][:home_dir]}/data"
default[:vxsync_client][:bluepill_log_dir] = "#{node[:vxsync_client][:log_directory]}/bluepill"
default[:vxsync_client][:record_retirement][:enabled] = true
default[:vxsync_client][:record_retirement][:minute] = '30'
default[:vxsync_client][:record_retirement][:hour] = '0'
default[:vxsync_client][:record_retirement][:weekday] = '*'
default[:vxsync_client][:record_retirement][:log_file] = 'patient-record-retirement-util.log'

default[:vxsync_client][:processes] = {
  :subscriber_vistahdr => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "vistahdr"
    },
  },
  :subscriber_prioritization_client => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "prioritization"
    }
  },
  :subscriber_jds_storage_client => {
    :template => "subscriber_host.sh.erb",
    :number_of_copies => 3,
    :config => {
      :profile => "jds-storage"
    }
  },
  :subscriber_solr_storage_client => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "solr-storage"
    }
  },
  :subscriber_primary => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "primary"
    }
  },
  :subscriber_jmeadows => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "jmeadows"
    }
  },
  :subscriber_hdr => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "hdr"
    }
  },
  :subscriber_vler => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "vler"
    }
  },
  :subscriber_vlerdas => {
      :template => "subscriber_host.sh.erb",
      :config => {
          :profile => "vlerdas"
      }
  },
  :subscriber_pgd => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "pgd"
    }
  },
  :subscriber_document => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "document"
    }
  },
  :subscriber_enrichment_client => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "enrichment"
    }
  },
  :subscriber_publish_client => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "publish"
    }
  },
  :subscriber_error_client => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "error"
    }
  },
  :subscriber_vistahdr => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "vistahdr"
    }
  },
  :subscriber_resync => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "resync"
    }
  },
  :subscriber_retirement => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "retirement"
    }
  },
  :'sync-request-endpoint' => {
    :template => "sync_request_endpoint.sh.erb",
    :config => {
      :port => PORT
    }
  },
  :'writeback-endpoint' => {
    :template => "writeback_endpoint.sh.erb",
    :config => {
      :port => PORT
    }
  },
  :'admin-endpoint-client' => {
    :template => "admin_endpoint.sh.erb",
    :config => {
      :port => PORT
    }
  }
}

default[:vxsync_client][:error_processes] = {
  :error_processor_client => {
    :template => "error_processor_host.sh.erb",
    :config => {
    }
  },
  :'error-endpoint' => {
    :template => "error_endpoint.sh.erb",
    :config => {
      :port => 8181
    }
  },
}

default[:vxsync_client][:jds_app_server_assignment] = nil

default[:vxsync_client][:vxsync_sync][:nerve] = {
  :check_interval => 10,
  :checks => [
    {
      type: "http",
      uri: "/ping",
      timeout: 5,
      rise: 3,
      fall: 2
    }
  ]
}

default[:vxsync_client][:vxsync_write_back][:nerve] = {
  :check_interval => 10,
  :checks => [
    {
      type: "http",
      uri: "/ping",
      timeout: 5,
      rise: 3,
      fall: 2
    }
  ]
}
