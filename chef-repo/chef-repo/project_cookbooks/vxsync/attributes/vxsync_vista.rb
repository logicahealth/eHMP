#
# Cookbook Name:: vxsync
# Attributes:: vxsync_vista
#

default[:vxsync][:vista][:home_dir] = '/opt/vxsync_vista'
default[:vxsync][:vista][:service_name] = 'vxsync_vista'
default[:vxsync][:vista][:log_directory] = "/var/log/vxsync"
default[:vxsync][:vista][:log_prefix] = "vxsync"
default[:vxsync][:vista][:log_ext] = ".log"
default[:vxsync][:vista][:log_pattern] = "#{node[:vxsync][:vista][:log_directory]}/#{node[:vxsync][:vista][:log_prefix]}#{node[:vxsync][:vista][:log_ext]}"
default[:vxsync][:vista][:config_file] = "#{node[:vxsync][:vista][:home_dir]}/worker-config.json"
default[:vxsync][:vista][:data_dir] = '/var/vxsync'
default[:vxsync][:vista][:beanstalk_dir] = '/var/vxsync/beanstalk_vista'
default[:vxsync][:vista][:documents_dir] = "#{node[:vxsync][:vista][:data_dir]}/documents"
default[:vxsync][:vista][:persistence_dir] = "#{node[:vxsync][:vista][:home_dir]}/data"
default[:vxsync][:vista][:bluepill_log_dir] = "#{node[:vxsync][:vista][:log_directory]}/bluepill"

default[:vxsync][:vista][:beanstalk_processes] = {
  :jobrepo_vista => {
    :template => "job_repo.sh.erb",
    :config => {
      :port => 5002,
      :max_file_size => node[:vxsync][:max_file_size]
    }
  }
}

default[:vxsync][:vista][:processes] = {
  :subscriber_error_vista => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "error"
    }
  },
  :subscriber_storage_vista => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "storage"
    },
    :number_of_copies => 3
  },
  :subscriber_enrichment_vista => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "enrichment"
    }
  },
  :subscriber_prioritization => {
    :template => "subscriber_host.sh.erb",
    :config => {
      :profile => "prioritization"
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
  :error_processor_vista => {
    :template => "error_processor_host.sh.erb",
    :config => {
    }
  },
  :'admin-endpoint-vista' => {
    :template => "admin_endpoint.sh.erb",
    :config => {
      :port => 9997
    }
  }
}
