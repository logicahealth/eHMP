#
# Cookbook Name:: vxsync
# Recipe:: default
#

# General Configuration
default[:vxsync][:start_vxsync_services] = true
default[:vxsync][:filename] = 'vxsync.zip'
default[:vxsync][:artifact_path] = "#{Chef::Config['file_cache_path']}/#{node[:vxsync][:filename]}"
default[:vxsync][:web_service_port] = 8080
default[:vxsync][:endpoint_max_sockets] = 5
default[:vxsync][:config_refresh] = 60000
default[:vxsync][:max_file_size] = 20000000
default[:vxsync][:vxsync_applications] = ["client", "vista"]
default[:vxsync][:clear_logs] = nil

# JDS Configuration
default[:vxsync][:jds_timeout] = 300000

# Solr Configuration
default[:vxsync][:trackSolrStorage] = true

# Beanstalk Configuration
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

# Publish Tube Configuration
default[:vxsync][:publish_tubes] = true

# Operational Data Configuration
default[:vxsync][:ods_attempts] = 10
default[:vxsync][:ods_delay] = 30
default[:vxsync][:default_expiration] = 3600000
default[:vxsync][:dod_expiration] = 3600000
default[:vxsync][:site_list] = ["9E7A", "C877"]

# HDR Configuration
default[:vxsync][:hdr_enabled] = true
default[:vxsync][:hdr_mode] = "REQ/RES"
default[:vxsync][:hdr_timeout] = 60000
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

# DoD Configuration
default[:vxsync][:jmeadows_enabled] = true
default[:vxsync][:jmeadows_timeout] = 60000

# Vler Configuration
default[:vxsync][:vler_enabled] = true
default[:vxsync][:vler_timeout] = 60000

# MVI Configuration
default[:vxsync][:mvi_timeout] = 60000

# Terminology Configuration
default[:vxsync][:terminology_timeout] = 60000
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

# Handler Worker Count Configurations
default[:vxsync][:profile][:worker_count] = 1
default[:vxsync][:profile][:error][:'error-request'][:worker_count] = node[:vxsync][:profile][:worker_count]

default[:vxsync][:profile][:primary][:'vista-subscribe-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:primary][:'enterprise-sync-request'][:worker_count] = 4
default[:vxsync][:profile][:primary][:'vista-operational-subscribe-request'][:worker_count] = node[:vxsync][:profile][:worker_count]

default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-allergy-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-appointment-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-consult-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-demographics-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-dischargeSummary-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-encounter-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-immunization-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-lab-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-medication-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-note-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-order-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-problem-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-progressNote-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-radiology-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-sync-vital-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-allergy-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-appointment-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-consult-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-demographics-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-dischargeSummary-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-encounter-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-immunization-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-lab-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-medication-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-note-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-order-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-problem-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-progressNote-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-radiology-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:jmeadows][:'jmeadows-xform-vital-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]

default[:vxsync][:profile][:hdr][:'hdr-sync-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-allergy-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-appointment-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-consult-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-cpt-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-document-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-image-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-immunization-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-lab-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-med-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-order-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-patient-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-pov-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-problem-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-procedure-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-surgery-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-vital-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-sync-visit-request'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-allergy-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-appointment-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-consult-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-cpt-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-document-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-image-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-immunization-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-lab-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-med-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-order-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-patient-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-pov-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-problem-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-procedure-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-surgery-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-vital-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:hdr][:'hdr-xform-visit-vpr'][:worker_count] = node[:vxsync][:profile][:worker_count]

default[:vxsync][:profile][:vistaProcessor][:'vista-record-processor-request'][:worker_count] = 4

default[:vxsync][:profile][:vler][:'vler-sync-request'][:worker_count] = 5
default[:vxsync][:profile][:vler][:'vler-xform-vpr'][:worker_count] = 5

default[:vxsync][:profile][:document][:'jmeadows-pdf-document-transform'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:document][:'jmeadows-document-retrieval'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:document][:'jmeadows-cda-document-conversion'][:worker_count] = node[:vxsync][:profile][:worker_count]

default[:vxsync][:profile][:storage][:'store-record'][:worker_count] = 5
default[:vxsync][:profile][:storage][:'solr-record-storage'][:worker_count] = 5
default[:vxsync][:profile][:storage][:'operational-store-record'][:worker_count] = 8

default[:vxsync][:profile][:enrichment][:'record-enrichment'][:worker_count] = 3

default[:vxsync][:profile][:prioritization][:'event-prioritization-request'][:worker_count] = 8

default[:vxsync][:profile][:publish][:'publish-data-change-event'][:worker_count] = node[:vxsync][:profile][:worker_count]

default[:vxsync][:profile][:resync][:'resync-request'][:worker_count] = node[:vxsync][:profile][:worker_count]

default[:vxsync][:profile][:update][:'record-update'][:worker_count] = node[:vxsync][:profile][:worker_count]

default[:vxsync][:profile][:retirement][:'patient-record-retirement'][:worker_count] = node[:vxsync][:profile][:worker_count]

default[:osync][:profile][:worker_count] = 1
default[:osync][:profile][:primary][:'admissions'][:worker_count] = node[:osync][:profile][:worker_count]
default[:osync][:profile][:primary][:'appointments'][:worker_count] = node[:osync][:profile][:worker_count]
default[:osync][:profile][:primary][:'sync'][:worker_count] = 6
default[:osync][:profile][:primary][:'patientlist'][:worker_count] = 4

# SOAP Handler Configuration
default[:soap_handler][:filename] = 'soap_handler.jar'
default[:soap_handler][:artifact_path] = "#{Chef::Config['file_cache_path']}/#{node[:soap_handler][:filename]}"
default[:soap_handler][:home_dir] = '/opt/soap_handler'
default[:soap_handler][:service_name] = 'soap_handler'
default[:soap_handler][:config_file] = "#{node[:soap_handler][:home_dir]}/config.json"
default[:soap_handler][:server_port] = "5400"
default[:soap_handler][:admin_port] = "5401"

default[:soap_handler][:security][:trust_store] = nil
default[:soap_handler][:security][:trust_store_pw] = nil
default[:soap_handler][:security][:key_store] = nil
default[:soap_handler][:security][:key_store_pw] = nil


# Error Processing Configuration
default[:error_processing][:jdsGetErrorLimit] = 1000
default[:error_processing][:profiles][:catastrophic_recovery][:enabled] = false
default[:error_processing][:profiles][:record_enrichment][:enabled] = false
default[:error_processing][:profiles][:activity_management][:enabled] = false
default[:error_processing][:profiles][:jmeadows][:enabled] = false
default[:error_processing][:profiles][:hdr][:enabled] = false
default[:error_processing][:profiles][:vler][:enabled] = false
default[:error_processing][:profiles][:pgd][:enabled] = false

# Opportunistic Sync (osync) Configuration
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
