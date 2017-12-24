#
# Cookbook Name:: fetch_server
# Recipe:: default
#

default[:fetch_server][:user] = 'node'
default[:fetch_server][:group] = 'node'
default[:fetch_server][:protocol] = 'http'
default[:fetch_server][:source] = nil
default[:fetch_server][:version] = 'DEVELOPMENT'
default[:fetch_server][:home_dir] = '/opt/fetch_server'
default[:fetch_server][:config][:xml_path] = "#{node[:fetch_server][:home_dir]}/src/resources/patient-search/xml"
default[:fetch_server][:log_dir] = '/var/log/fetch_server'
default[:fetch_server][:pid_dir] = '/var/run/fetch_server'
default[:fetch_server][:audit_log_path] = "#{node[:fetch_server][:log_dir]}/audit.log"
default[:fetch_server][:audit_host] = 'IP        '
default[:fetch_server][:audit_port] = 'PORT'
default[:fetch_server][:complex_note_port] = 'PORT'
default[:fetch_server][:node_dev_home]= '/usr/local/bin/'
default[:fetch_server][:cookie_prefix] = 'ehmp.vistacore'
default[:fetch_server][:tls_reject_unauthorized] = 0
default[:fetch_server][:oracledb_module][:version] = '1.12.2'

# Note the interactions between the oracle_connection_pool minimum and the uv_threadpool_size
# The uv_threadpool_size sets the number of threads to be utilized by a node process to handle async requests.
# The uv_threadpool_size should be at least as big as the connection pool, up to a maximum of 128
# See https://github.com/oracle/node-oracledb/blob/master/doc/api.md#numberofthreads
#
# Also be aware that uv_threadpool_size is not just related to Oracle connection pools, it can affect other aysnc
# operations as well, particularly those involving native code modules.
# However, documentation is sparse and online reading conflicting so it is unclear if filesystem  and general network operations
# are affected.  Adding to confusion is the strategies have changed under different node releases.
default[:fetch_server][:oracle_connection_pool][:minimum] = '0'
default[:fetch_server][:oracle_connection_pool][:maximum] = '4'
default[:fetch_server][:uv_threadpool_size] = 4
default[:fetch_server][:write_dir] = "#{node[:fetch_server][:home_dir]}/src/write"

# log levels
default[:fetch_server][:log_level][:fetch_server] = 'info'
default[:fetch_server][:log_level][:audit][:fetch_server] = 'info'
default[:fetch_server][:log_level][:solr_client][:node_event] = "warn"
default[:fetch_server][:log_level][:solr_client][:zookeeper_event] = "warn"
default[:fetch_server][:log_level][:solr_client][:child_instance_enabled] = false

# ehmp-config
## feature flag attributes
default[:fetch_server][:trackSolrStorage] = true

## settings attributes
default[:fetch_server][:settings][:solrIndexingDelayMillis] = 3000

# some common default attributes for jdsSync/reSyncs
default[:fetch_server][:jdsSync][:settings][:waitMillis] = 1000
default[:fetch_server][:jdsSync][:settings][:timeoutMillis] = 420000
default[:fetch_server][:jdsSync][:settings][:syncExistsWaitDelayMillis] = 30000
default[:fetch_server][:resync][:openJobsTimeoutMillis] = 21600000
default[:fetch_server][:resync][:inProgressTimeoutMillis] = 86400000
default[:fetch_server][:resync][:inactivityTimeoutMillis] = 86400000
default[:fetch_server][:resync][:lastSyncMaxIntervalMillis] = 600000

# asu timout
default[:fetch_server][:asu][:timeout] = 120000

# APM attirbutes
default[:fetch_server][:enable_apm] = false
default[:fetch_server][:apm][:probe_name] = "fetch_server"

# app_dynamics attributes
default[:fetch_server][:enable_app_dynamics] = false
default[:fetch_server][:app_dynamics][:agent_tier_name] = "fetch_server"

default[:fetch_server][:incidents][:root_directory] = '/var/incidents'
default[:fetch_server][:incidents][:notification_email] = {
		from: '"eHMP System Alert" <noreply@fetch_server>',
		# to, cc, and bcc are comma-separated emails
		to: 'Flag-Incident-Report@accenturefederal.com',
		# cc: 'root@localhost',
}

default[:fetch_server][:email_transport] = {
		host: 'localhost', # postfix should be running on the machine
		# port: 587, # secure
		# requireTls: true, # secure
		port: 25, # insecure
}

default[:fetch_server][:logrotate][:name] = 'fetch_server_logs'
default[:fetch_server][:logrotate][:path] = "#{node[:fetch_server][:log_dir]}/*.log"
default[:fetch_server][:logrotate][:rotate] = 10
default[:fetch_server][:logrotate][:options] = %w{missingok compress delaycompress copytruncate notifempty dateext}
default[:fetch_server][:logrotate][:frequency] = 'daily'
default[:fetch_server][:logrotate][:dateformat] = '-%Y%m%d%s'

default[:fetch_server][:logrotate][:incidents][:name] = 'ehmp_incident_logs'
default[:fetch_server][:logrotate][:incidents][:path] = "#{node[:fetch_server][:incidents][:root_directory]}/*/eHMP-IR-*.txt"
default[:fetch_server][:logrotate][:incidents][:rotate] = 10
default[:fetch_server][:logrotate][:incidents][:options] = %w{missingok compress delaycompress dateext}
default[:fetch_server][:logrotate][:incidents][:frequency] = 'daily'
default[:fetch_server][:logrotate][:incidents][:dateformat] = '-%Y%m%d%s'

default[:fetch_server][:sslCACertName] = 'ssl_ca.crt'

default[:fetch_server][:xpolog_baseurl] = nil
default[:fetch_server][:xpolog_url] = nil

default[:fetch_server][:ssl_files][:data_bags][:public_ca_db] = "root_ca"

default[:fetch_server][:interceptors] = [
    {:name => 'authentication', :disabled => false, :readOnly => true},
    {:name => 'pep', :disabled => false},
    {:name => 'operationalDataCheck', :disabled => false},
    {:name => 'synchronize', :disabled => false}
]

default[:fetch_server][:service_config] = {
	processes: 1,
	name: 'fetch_server',
	service_run_level: '2345',
	service_template_source: 'upstart-node_process.erb',
	bluepill_template_source: 'node_process-cluster.pill.erb',
	port: PORT,
	deploy_path: 'bin/rdk-fetch-server.js',
	source: 'fetch-server-config.json.erb',
	destination: "#{node[:fetch_server][:home_dir]}/config/rdk-fetch-server-config",
	debug_port: 5858,
	max_sockets: '5',
	nerve: {
		check_interval: 30,
		checks: [
			{
				type: "http",
				uri: "/resource/version",
				timeout: 5,
				rise: 3,
				fall: 2
			}
		]
	}
}

default[:fetch_server][:jds_app_server_assignment] = nil

default[:fetch_server][:vxsync_client_machine_ident] = 'vxsync'
