#
# Cookbook Name:: vxsync
# Recipe:: default
#

# General Configuration
default[:vxsync][:user] = 'node'
default[:vxsync][:group] = 'node'
default[:vxsync][:start_vxsync_services] = true
default[:vxsync][:filename] = 'vxsync.zip'
default[:vxsync][:artifact_path] = "#{Chef::Config['file_cache_path']}/#{node[:vxsync][:filename]}"
default[:vxsync][:web_service_port] = 8080
default[:vxsync][:endpoint_max_sockets] = 5
default[:vxsync][:handler_max_sockets] = 5
default[:vxsync][:config_refresh] = 60000
default[:vxsync][:max_file_size] = 20000000
default[:vxsync][:vxsync_applications] = ["vista", "client"]
default[:vxsync][:clear_logs] = nil
default[:vxsync][:lzma_min_size] = 1887430

# Logrotate configuration
default[:vxsync][:logrotate][:name] = 'vxsync_logs'
default[:vxsync][:logrotate][:log_directory] = '/var/log/vxsync/*.log'
default[:vxsync][:logrotate][:rotate] = 10
default[:vxsync][:logrotate][:options] = %w{missingok compress delaycompress copytruncate notifempty dateext}
default[:vxsync][:logrotate][:frequency] = 'daily'
default[:vxsync][:logrotate][:dateformat] = '-%Y%m%d%s'

default[:vxsync][:audit][:logrotate][:name] = 'vxsync_audit_logs'
default[:vxsync][:audit][:logrotate][:log_directory] = '/var/log/vxsync/audit/*.log'
default[:vxsync][:audit][:logrotate][:rotate] = 10
default[:vxsync][:audit][:logrotate][:options] = %w{missingok compress delaycompress copytruncate notifempty dateext}
default[:vxsync][:audit][:logrotate][:frequency] = 'daily'
default[:vxsync][:audit][:logrotate][:dateformat] = '-%Y%m%d%s'

# JDS Configuration
default[:vxsync][:jds_timeout] = 300000

# PJDS Configuration
default[:vxsync][:pjds][:username] = "osync1"

# Solr Configuration
default[:vxsync][:trackSolrStorage] = true

# Beanstalk Configuration
default[:vxsync][:beanstalk_ttr] = 120
default[:vxsync][:beanstalk_priority] = 10
default[:vxsync][:beanstalk_delay] = 0
default[:vxsync][:beanstalk_timeout] = 10
default[:vxsync][:beanstalk_init_millis] = 1000
default[:vxsync][:beanstalk_max_millis] = 15000
default[:vxsync][:beanstalk_inc_millis] = 1000

# Shutdown Timeout Configuration
default[:vxsync][:shutdown_timeout][:poller_host_millis] = 30000
default[:vxsync][:shutdown_timeout][:subscriber_host_millis] = 30000
default[:vxsync][:shutdown_timeout][:all_timeout_seconds] = 31

# Publish Tube Configuration
default[:vxsync][:publish_tubes] = true

# Operational Data Configuration
default[:vxsync][:ods_attempts] = 10
default[:vxsync][:ods_delay] = 30
default[:vxsync][:default_expiration] = 3600000
default[:vxsync][:dod_expiration] = 3600000
default[:vxsync][:site_list] = ["SITE", "SITE"]

# HDR Configuration
default[:vxsync][:hdr_enabled] = true
default[:vxsync][:hdr_mode] = "REQ/RES"
default[:vxsync][:hdr_timeout] = 60000
default[:vxsync][:mvi_timeout] = 60000
default[:vxsync][:terminology_timeout] = 60000
default[:vxsync][:jds_timeout] = 300000
default[:vxsync][:activity_filter_sites] = nil
default[:vxsync][:hdr_blacklist_sites] = [
  {
    "site_hash" => "SITE",
    "station_number" => 202
  },
  {
    "site_hash" => "SITE",
    "station_number" => 504
  }
]

default[:vxsync][:log_level][:error_handling] = "debug"
default[:vxsync][:log_level][:loggers] = {
  :root => "warn"
}
default[:vxsync][:log_level][:solr_client][:node_event] = "warn"
default[:vxsync][:log_level][:solr_client][:zookeeper_event] = "warn"
default[:vxsync][:log_level][:solr_client][:child_instance_enabled] = false

# APM attirbutes
default[:vxsync][:enable_apm] = false
default[:vxsync][:apm][:probe_name] = "VFSS"

# app_dynamics attributes
default[:vxsync][:enable_app_dynamics] = false
default[:vxsync][:app_dynamics][:agent_tier_name] = "VXSYNC"

# DoD Configuration
default[:vxsync][:jmeadows_enabled] = true
default[:vxsync][:jmeadows_timeout] = 60000

# VLER type selection
default[:vxsync][:vler_selector] = 'vler'

# Vler Configuration
default[:vxsync][:vler_enabled] = true
default[:vxsync][:vler_timeout] = 60000

# VlerDas Configuration
default[:vxsync][:vlerdas_enabled] = true
default[:vxsync][:vlerdas][:query_duration_days] = 180
default[:vxsync][:vlerdas][:vler_form_data][:org] = 'eHMP'
default[:vxsync][:vlerdas][:vler_form_data][:role_code] = '112247003'
default[:vxsync][:vlerdas][:vler_form_data][:purpose_code] = 'TREATMENT'
default[:vxsync][:vlerdas][:vler_form_data][:va_facility_code] = '459CH'
default[:vxsync][:vlerdas][:vler_form_data][:family_name] = 'May'
default[:vxsync][:vlerdas][:vler_form_data][:given_name] = 'John'
default[:vxsync][:vlerdas][:notification_callback][:protocol] = 'http'
# Should be set to 'development' for development, test and build environments
# Should be set to 'production' for all other environments
default[:vxsync][:vlerdas][:notification_callback][:environment] = 'development'

# MVI Configuration
default[:vxsync][:mvi_timeout] = 60000

# Terminology Configuration
default[:vxsync][:terminology_timeout] = 60000

# VistaRecordPoller - duplicate error time window in seconds
default[:vxsync][:poller][:ignore_duplicate_error_time] = 1800

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

default[:vxsync][:profile][:vler][:'vler-sync-request'][:worker_count] = 3
default[:vxsync][:profile][:vler][:'vler-xform-vpr'][:worker_count] = 3

default[:vxsync][:profile][:vlerdas][:'vler-das-sync-request'][:worker_count] = 1
default[:vxsync][:profile][:vlerdas][:'vler-das-doc-retrieve'][:worker_count] = 2
default[:vxsync][:profile][:vlerdas][:'vler-das-xform-vpr'][:worker_count] = 2

default[:vxsync][:profile][:document][:'jmeadows-pdf-document-transform'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:document][:'jmeadows-document-retrieval'][:worker_count] = node[:vxsync][:profile][:worker_count]
default[:vxsync][:profile][:document][:'jmeadows-cda-document-conversion'][:worker_count] = node[:vxsync][:profile][:worker_count]

default[:vxsync][:profile][:'jds-storage'][:'store-record'][:worker_count] = 8
default[:vxsync][:profile][:'jds-storage'][:'operational-store-record'][:worker_count] = 8

default[:vxsync][:profile][:'solr-storage'][:'solr-record-storage'][:worker_count] = 8

default[:vxsync][:profile][:enrichment][:'record-enrichment'][:worker_count] = 3

default[:vxsync][:profile][:prioritization][:'event-prioritization-request'][:worker_count] = 4

default[:vxsync][:profile][:publish][:'publish-data-change-event'][:worker_count] = node[:vxsync][:profile][:worker_count]

default[:vxsync][:profile][:resync][:'resync-request'][:worker_count] = node[:vxsync][:profile][:worker_count]

default[:vxsync][:profile][:update][:'record-update'][:worker_count] = node[:vxsync][:profile][:worker_count]

default[:vxsync][:profile][:retirement][:'patient-record-retirement'][:worker_count] = node[:vxsync][:profile][:worker_count]

default[:vxsync][:profile][:notification][:'sync-notification'][:worker_count] = node[:vxsync][:profile][:worker_count]

# The uv_threadpool_size sets the number of threads to be utilized by a node process to handle async requests.
# The uv_threadpool_size has a maximum of 128
# Although initially identified in relation to rdk oracle connection pooling, this value may have impact on performance
# in relation to other async actions as well
#
# Although initially identified in relation to rdk oracle connection pooling, be aware that uv_threadpool_size is not
# just related to Oracle connection pools, it can affect other aysnc operations as well, particularly those involving
# native code modules. However, documentation is sparse and online reading conflicting so it is unclear if filesystem
# and general network operations are affected.  Adding to confusion is the strategies have changed under different node releases.
default[:vxsync][:uv_threadpool_size] = 4

#Sync Notifications
default[:vxsync][:syncNotifications] = {
  :discharge => {
    :dataDomain => "discharge"
  }
}

# Error Processing Configuration
default[:error_processing][:jdsGetErrorLimit] = 1000
default[:error_processing][:loop_delay_millis] = 30000
default[:error_processing][:error_retry_limit] = 5
default[:error_processing][:profiles][:catastrophic_recovery][:enabled] = false
default[:error_processing][:profiles][:catastrophic_recovery][:loop_delay_millis] = 30000
default[:error_processing][:profiles][:record_enrichment][:enabled] = true
default[:error_processing][:profiles][:record_enrichment][:loop_delay_millis] = 30000
default[:error_processing][:profiles][:activity_management][:enabled] = false
default[:error_processing][:profiles][:activity_management][:loop_delay_millis] = 30000
default[:error_processing][:profiles][:jmeadows][:enabled] = false
default[:error_processing][:profiles][:jmeadows][:loop_delay_millis] = 30000
default[:error_processing][:profiles][:hdr][:enabled] = false
default[:error_processing][:profiles][:hdr][:loop_delay_millis] = 30000
default[:error_processing][:profiles][:vler][:enabled] = false
default[:error_processing][:profiles][:vler][:loop_delay_millis] = 30000
default[:error_processing][:profiles][:vlerdas][:enabled] = false
default[:error_processing][:profiles][:vlerdas][:loop_delay_millis] = 30000
default[:error_processing][:profiles][:pgd][:enabled] = false
default[:error_processing][:profiles][:pgd][:loop_delay_millis] = 30000
