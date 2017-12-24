#
# Cookbook Name:: pick_list
# Recipe:: default
#

default[:pick_list][:user] = 'node'
default[:pick_list][:group] = 'node'
default[:pick_list][:protocol] = 'http'
default[:pick_list][:source] = nil
default[:pick_list][:version] = 'DEVELOPMENT'
default[:pick_list][:home_dir] = '/opt/pick_list'
default[:pick_list][:config][:xml_path] = "#{node[:pick_list][:home_dir]}/src/resources/patient-search/xml"
default[:pick_list][:log_dir] = '/var/log/pick_list'
default[:pick_list][:pid_dir] = '/var/run/pick_list'
default[:pick_list][:audit_log_path] = "#{node[:pick_list][:log_dir]}/audit.log"
default[:pick_list][:audit_host] = 'IP        '
default[:pick_list][:audit_port] = 'PORT'
default[:pick_list][:complex_note_port] = 'PORT'
default[:pick_list][:node_dev_home]= '/usr/local/bin/'
default[:pick_list][:cookie_prefix] = 'ehmp.vistacore'
default[:pick_list][:tls_reject_unauthorized] = 0
default[:pick_list][:oracledb_module][:version] = '1.12.2'

# Note the interactions between the oracle_connection_pool minimum and the uv_threadpool_size
# The uv_threadpool_size sets the number of threads to be utilized by a node process to handle async requests.
# The uv_threadpool_size should be at least as big as the connection pool, up to a maximum of 128
# See https://github.com/oracle/node-oracledb/blob/master/doc/api.md#numberofthreads
#
# Also be aware that uv_threadpool_size is not just related to Oracle connection pools, it can affect other aysnc
# operations as well, particularly those involving native code modules.
# However, documentation is sparse and online reading conflicting so it is unclear if filesystem  and general network operations
# are affected.  Adding to confusion is the strategies have changed under different node releases.
default[:pick_list][:oracle_connection_pool][:minimum] = '0'
default[:pick_list][:oracle_connection_pool][:maximum] = '4'
default[:pick_list][:uv_threadpool_size] = 4
default[:pick_list][:write_dir] = "#{node[:pick_list][:home_dir]}/src/write"

# log levels
default[:pick_list][:log_level][:pick_list_server] = 'info'
default[:pick_list][:log_level][:audit][:pick_list_server] = 'info'
default[:pick_list][:log_level][:solr_client][:node_event] = "warn"
default[:pick_list][:log_level][:solr_client][:zookeeper_event] = "warn"
default[:pick_list][:log_level][:solr_client][:child_instance_enabled] = false

# ehmp-config
## feature flag attributes
default[:pick_list][:trackSolrStorage] = true

## settings attributes
default[:pick_list][:settings][:solrIndexingDelayMillis] = 3000

# some common default attributes for jdsSync/reSyncs
default[:pick_list][:jdsSync][:settings][:waitMillis] = 1000
default[:pick_list][:jdsSync][:settings][:timeoutMillis] = 420000
default[:pick_list][:jdsSync][:settings][:syncExistsWaitDelayMillis] = 30000
default[:pick_list][:resync][:openJobsTimeoutMillis] = 21600000
default[:pick_list][:resync][:inProgressTimeoutMillis] = 86400000
default[:pick_list][:resync][:inactivityTimeoutMillis] = 86400000
default[:pick_list][:resync][:lastSyncMaxIntervalMillis] = 600000

# asu timout
default[:pick_list][:asu][:timeout] = 120000

# APM attirbutes
default[:pick_list][:enable_apm] = false
default[:pick_list][:apm][:probe_name] = "pick_list"

# app_dynamics attributes
default[:pick_list][:enable_app_dynamics] = false
default[:pick_list][:app_dynamics][:agent_tier_name] = "pick_list"

default[:pick_list][:incidents][:root_directory] = '/var/incidents'

default[:pick_list][:logrotate][:name] = 'pick_list_logs'
default[:pick_list][:logrotate][:path] = "#{node[:pick_list][:log_dir]}/*.log"
default[:pick_list][:logrotate][:rotate] = 10
default[:pick_list][:logrotate][:options] = %w{missingok compress delaycompress copytruncate notifempty dateext}
default[:pick_list][:logrotate][:frequency] = 'daily'
default[:pick_list][:logrotate][:dateformat] = '-%Y%m%d%s'

default[:pick_list][:logrotate][:incidents][:name] = 'ehmp_incident_logs'
default[:pick_list][:logrotate][:incidents][:path] = "#{node[:pick_list][:incidents][:root_directory]}/*/eHMP-IR-*.txt"
default[:pick_list][:logrotate][:incidents][:rotate] = 10
default[:pick_list][:logrotate][:incidents][:options] = %w{missingok compress delaycompress dateext}
default[:pick_list][:logrotate][:incidents][:frequency] = 'daily'
default[:pick_list][:logrotate][:incidents][:dateformat] = '-%Y%m%d%s'

default[:pick_list][:xpolog_baseurl] = nil
default[:pick_list][:xpolog_url] = nil

default[:pick_list][:interceptors] = [
    {:name => 'authentication', :disabled => false, :readOnly => true},
    {:name => 'pep', :disabled => false},
    {:name => 'operationalDataCheck', :disabled => false},
    {:name => 'synchronize', :disabled => false}
]

default[:pick_list][:service_config] = {
	processes: 1,
	name: 'pick_list',
	service_run_level: '2345',
	service_template_source: 'upstart-node_process.erb',
	bluepill_template_source: 'node_process-cluster.pill.erb',
	max_old_space: 2048,
	port: PORT,
	deploy_path: 'bin/rdk-pick-list-server.js',
	source: 'pick-list-server-config.json.erb',
	destination: "#{node[:pick_list][:home_dir]}/config/rdk-pick-list-server-config",
	debug_port: 5878,
	max_sockets: '5',
	nerve: {
		check_interval: 30,
		checks: [
			{
				type: "http",
				uri: "/resource/write-pick-list/version",
				timeout: 15,
				rise: 3,
				fall: 2
			}
		]
	}
}

default[:pick_list][:jds_app_server_assignment] = nil

default[:pick_list][:vxsync_client_machine_ident] = 'vxsync'
