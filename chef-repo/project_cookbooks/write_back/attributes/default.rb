#
# Cookbook Name:: write_back
# Recipe:: default
#

default[:write_back][:user] = 'node'
default[:write_back][:group] = 'node'
default[:write_back][:protocol] = 'http'
default[:write_back][:source] = nil
default[:write_back][:version] = 'DEVELOPMENT'
default[:write_back][:home_dir] = '/opt/write_back'
default[:write_back][:config][:xml_path] = "#{node[:write_back][:home_dir]}/src/resources/patient-search/xml"
default[:write_back][:log_dir] = '/var/log/write_back'
default[:write_back][:pid_dir] = '/var/run/write_back'
default[:write_back][:audit_log_path] = "#{node[:write_back][:log_dir]}/audit.log"
default[:write_back][:audit_host] = 'IP        '
default[:write_back][:audit_port] = 'PORT'
default[:write_back][:complex_note_port] = 'PORT'
default[:write_back][:node_dev_home]= '/usr/local/bin/'
default[:write_back][:cookie_prefix] = 'ehmp.vistacore'
default[:write_back][:tls_reject_unauthorized] = 0
default[:write_back][:oracledb_module][:version] = '1.12.2'

# Note the interactions between the oracle_connection_pool minimum and the uv_threadpool_size
# The uv_threadpool_size sets the number of threads to be utilized by a node process to handle async requests.
# The uv_threadpool_size should be at least as big as the connection pool, up to a maximum of 128
# See https://github.com/oracle/node-oracledb/blob/master/doc/api.md#numberofthreads
#
# Also be aware that uv_threadpool_size is not just related to Oracle connection pools, it can affect other aysnc
# operations as well, particularly those involving native code modules.
# However, documentation is sparse and online reading conflicting so it is unclear if filesystem  and general network operations
# are affected.  Adding to confusion is the strategies have changed under different node releases.
default[:write_back][:oracle_connection_pool][:minimum] = '0'
default[:write_back][:oracle_connection_pool][:maximum] = '4'
default[:write_back][:uv_threadpool_size] = 4
default[:write_back][:write_dir] = "#{node[:write_back][:home_dir]}/src/write"

# log levels
default[:write_back][:log_level][:write_back_server] = 'info'
default[:write_back][:log_level][:audit][:write_back_server] = 'info'
default[:write_back][:log_level][:solr_client][:node_event] = "warn"
default[:write_back][:log_level][:solr_client][:zookeeper_event] = "warn"
default[:write_back][:log_level][:solr_client][:child_instance_enabled] = false

# ehmp-config
## feature flag attributes
default[:write_back][:trackSolrStorage] = true

## settings attributes
default[:write_back][:settings][:solrIndexingDelayMillis] = 3000

# some common default attributes for jdsSync/reSyncs
default[:write_back][:jdsSync][:settings][:waitMillis] = 1000
default[:write_back][:jdsSync][:settings][:timeoutMillis] = 420000
default[:write_back][:jdsSync][:settings][:syncExistsWaitDelayMillis] = 30000
default[:write_back][:resync][:openJobsTimeoutMillis] = 21600000
default[:write_back][:resync][:inProgressTimeoutMillis] = 86400000
default[:write_back][:resync][:inactivityTimeoutMillis] = 86400000
default[:write_back][:resync][:lastSyncMaxIntervalMillis] = 600000

# asu timout
default[:write_back][:asu][:timeout] = 120000

# APM attirbutes
default[:write_back][:enable_apm] = false
default[:write_back][:apm][:probe_name] = "write_back"

# app_dynamics attributes
default[:write_back][:enable_app_dynamics] = false
default[:write_back][:app_dynamics][:agent_tier_name] = "write_back"

default[:write_back][:incidents][:root_directory] = '/var/incidents'

default[:write_back][:logrotate][:name] = 'write_back_logs'
default[:write_back][:logrotate][:path] = "#{node[:write_back][:log_dir]}/*.log"
default[:write_back][:logrotate][:rotate] = 10
default[:write_back][:logrotate][:options] = %w{missingok compress delaycompress copytruncate notifempty dateext}
default[:write_back][:logrotate][:frequency] = 'daily'
default[:write_back][:logrotate][:dateformat] = '-%Y%m%d%s'

default[:write_back][:logrotate][:incidents][:name] = 'ehmp_incident_logs'
default[:write_back][:logrotate][:incidents][:path] = "#{node[:write_back][:incidents][:root_directory]}/*/eHMP-IR-*.txt"
default[:write_back][:logrotate][:incidents][:rotate] = 10
default[:write_back][:logrotate][:incidents][:options] = %w{missingok compress delaycompress dateext}
default[:write_back][:logrotate][:incidents][:frequency] = 'daily'
default[:write_back][:logrotate][:incidents][:dateformat] = '-%Y%m%d%s'

default[:write_back][:interceptors] = [
    {:name => 'authentication', :disabled => false, :readOnly => true},
    {:name => 'pep', :disabled => false},
    {:name => 'operationalDataCheck', :disabled => false},
    {:name => 'synchronize', :disabled => false}
]

default[:write_back][:service_config] = {
	processes: 1,
	name: 'write_back',
	service_run_level: '2345',
	service_template_source: 'upstart-node_process.erb',
	bluepill_template_source: 'node_process-cluster.pill.erb',
	port: 9999,
	deploy_path: 'bin/rdk-write-server.js',
	source: 'write-server-config.json.erb',
	destination: "#{node[:write_back][:home_dir]}/config/rdk-write-server-config",
	debug_port: 5868,
	max_sockets: '5',
	nerve: {
		check_interval: 30,
		checks: [
			type: "http",
			uri: "/resource/write-health-data/version",
			timeout: 5,
			rise: 3,
			fall: 2
		]
	}
}

default[:write_back][:jds_app_server_assignment] = nil

default[:write_back][:vxsync_client_machine_ident] = 'vxsync'
