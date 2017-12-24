#
# Cookbook Name:: vxsync
# Attributes:: vxsync_vista
#

default[:vxsync_vista][:home_dir] = '/opt/vxsync_vista'
default[:vxsync_vista][:service_name] = 'vxsync_vista'
default[:vxsync_vista][:log_directory] = "/var/log/vxsync"
default[:vxsync_vista][:log_prefix] = "vxsync"
default[:vxsync_vista][:log_ext] = ".log"
default[:vxsync_vista][:log_pattern] = "#{node[:vxsync_vista][:log_directory]}/#{node[:vxsync_vista][:log_prefix]}#{node[:vxsync_vista][:log_ext]}"
default[:vxsync_vista][:config_file] = "#{node[:vxsync_vista][:home_dir]}/worker-config.json"
default[:vxsync_vista][:data_dir] = '/var/vxsync'
default[:vxsync_vista][:documents_dir] = "#{node[:vxsync_vista][:data_dir]}/documents"
default[:vxsync_vista][:persistence_dir] = "#{node[:vxsync_vista][:home_dir]}/data"
default[:vxsync_vista][:bluepill_log_dir] = "#{node[:vxsync_vista][:log_directory]}/bluepill"

default[:vxsync_vista][:processes] = {
  :subscriber_error_vista => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "error"
    }
  },
  :subscriber_jds_storage_vista => {
    :template => "subscriber_host.sh.erb",
    :number_of_copies => 3,
    :config => {
      :profile => "jds-storage"
    }
  },
  :subscriber_solr_storage_vista => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "solr-storage"
    }
  },
  :subscriber_enrichment_vista => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "enrichment"
    }
  },
  :subscriber_prioritization_vista => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "prioritization"
    }
  },
  :subscriber_notification => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "notification"
    }
  },
  :subscriber_publish_vista => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "publish"
    }
  },
  :subscriber_vistaProcessor => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "vistaProcessor"
    }
  },
  :'admin-endpoint-vista' => {
    :template => "admin_endpoint.sh.erb",
    :config => {
      :port => 9997
    }
  }
}

default[:vxsync_vista][:jds_app_server_assignment] = nil
