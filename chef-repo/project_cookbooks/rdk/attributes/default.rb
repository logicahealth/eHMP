#
# Cookbook Name:: rdk
# Recipe:: default
#

default[:rdk][:protocol] = 'http'
default[:rdk][:source] = nil
default[:rdk][:version] = 'DEVELOPMENT'
default[:rdk][:home_dir] = '/opt/rdk'
default[:rdk][:config][:xml_path] = "#{node[:rdk][:home_dir]}/src/resources/patient-search/xml"
default[:rdk][:log_dir] = '/var/log/rdk'
default[:rdk][:pid_dir] = '/var/run/rdk'
default[:rdk][:audit_log_path] = "#{node[:rdk][:log_dir]}/audit.log"
default[:rdk][:audit_host] = 'IP        '
default[:rdk][:audit_port] = 'PORT'
default[:rdk][:complex_note_port] = '8080'
default[:rdk][:node_dev_home]= '/usr/local/bin/'
default[:rdk][:cookie_prefix] = 'ehmp.vistacore'
default[:rdk][:tls_reject_unauthorized] = 0
default[:rdk][:oracledb_module][:version] = '1.10.0'
default[:rdk][:write_dir] = "#{node[:rdk][:home_dir]}/src/write"
default[:rdk][:activity_handler_ops_scripts_dir] = '/opt/activities-cli'

# log levels
default[:rdk][:log_level][:fetch_server] = 'debug'
default[:rdk][:log_level][:audit][:fetch_server] = 'info'
default[:rdk][:log_level][:pick_list_server] = 'debug'
default[:rdk][:log_level][:audit][:pick_list_server] = 'info'
default[:rdk][:log_level][:write_back_server] = 'debug'
default[:rdk][:log_level][:audit][:write_back_server] = 'info'
default[:rdk][:log_level][:activity_handler] = 'warn'

# activity handler attributes
default[:rdk][:activity_handler][:activityManagementJobRetryLimit] = 5

# Worker Count Configurations
default[:rdk][:activity_handler][:worker_count] = 1
default[:rdk][:activity_handler][:beanstalk][:jobTypes][:'activity-management-event'][:worker_count] = 1
default[:rdk][:activity_handler][:beanstalk][:jobTypes][:'error-request'][:worker_count] = 1

# ehmp-config
## feature flag attributes
default[:rdk][:trackSolrStorage] = true

## settings attributes
default[:rdk][:settings][:solrIndexingDelayMillis] = 3000

# some common default attributes for jdsSync/reSyncs
default[:rdk][:jdsSync][:settings][:waitMillis] = 1000
default[:rdk][:jdsSync][:settings][:timeoutMillis] = 420000
default[:rdk][:jdsSync][:settings][:syncExistsWaitDelayMillis] = 30000
default[:rdk][:resync][:openJobsTimeoutMillis] = 21600000
default[:rdk][:resync][:inProgressTimeoutMillis] = 86400000
default[:rdk][:resync][:inactivityTimeoutMillis] = 86400000
default[:rdk][:resync][:lastSyncMaxIntervalMillis] = 600000

default[:rdk][:incidents][:root_directory] = '/var/incidents'
default[:rdk][:incidents][:notification_email] = {
		from: '"eHMP System Alert" <noreply@rdk>',
		# to, cc, and bcc are comma-separated emails
		to: 'Flag-Incident-Report@accenturefederal.com',
		# cc: 'root@localhost',
}

default[:rdk][:email_transport] = {
		host: 'localhost', # postfix should be running on the machine
		# port: 587, # secure
		# requireTls: true, # secure
		port: 25, # insecure
}

default[:rdk][:logrotate][:name] = 'rdk_logs'
default[:rdk][:logrotate][:path] = "#{node[:rdk][:log_dir]}/*.log"
default[:rdk][:logrotate][:rotate] = 10
default[:rdk][:logrotate][:options] = %w{missingok compress delaycompress copytruncate notifempty dateext}
default[:rdk][:logrotate][:frequency] = 'daily'
default[:rdk][:logrotate][:dateformat] = '-%Y%m%d%s'

default[:rdk][:logrotate][:incidents][:name] = 'ehmp_incident_logs'
default[:rdk][:logrotate][:incidents][:path] = "#{node[:rdk][:incidents][:root_directory]}/*/eHMP-IR-*.txt"
default[:rdk][:logrotate][:incidents][:rotate] = 10
default[:rdk][:logrotate][:incidents][:options] = %w{missingok compress delaycompress dateext}
default[:rdk][:logrotate][:incidents][:frequency] = 'daily'
default[:rdk][:logrotate][:incidents][:dateformat] = '-%Y%m%d%s'

default[:rdk][:sslCACertName] = 'ssl_ca.crt'

default[:rdk][:xpolog_baseurl] = nil
default[:rdk][:xpolog_url] = nil

default[:rdk][:ssl_files][:data_bags][:public_ca_db] = "root_ca"

default[:rdk][:interceptors] = [
    {:name => 'authentication', :disabled => false, :readOnly => true},
    {:name => 'pep', :disabled => false},
    {:name => 'operationalDataCheck', :disabled => false},
    {:name => 'synchronize', :disabled => false}
]

default[:rdk][:services] = {
	fetch_server: {
		processes: 1,
		service: 'fetch_server',
		service_run_level: '2345',
		service_template_source: 'upstart-node_process.erb',
		bluepill_template_source: 'node_process-cluster.pill.erb',
		port: 8888,
		deploy_path: 'bin/rdk-fetch-server.js',
		config_source: 'rdk-fetch-server-config.json.erb',
		config_destination: "#{node[:rdk][:home_dir]}/config/rdk-fetch-server-config",
		debug_port: 5858,
		max_sockets: '-1',
		nerve: {
			check_interval: 2,
			checks: [
				{
					type: "http",
					uri: "/resource/version",
					timeout: 0.2,
					rise: 3,
					fall: 2
				}
			]
		}
	},
	write_back: {
		processes: 1,
		service: 'write_back',
		service_run_level: '2345',
		service_template_source: 'upstart-node_process.erb',
		bluepill_template_source: 'node_process-cluster.pill.erb',
		port: 9999,
		deploy_path: 'bin/rdk-write-server.js',
		config_source: 'rdk-write-server-config.json.erb',
		config_destination: "#{node[:rdk][:home_dir]}/config/rdk-write-server-config",
		debug_port: 5868,
		max_sockets: '-1',
		nerve: {
			check_interval: 2,
			checks: [
				type: "http",
				uri: "/resource/write-health-data/version",
				timeout: 0.2,
				rise: 3,
				fall: 2
			]
		}
	},
	pick_list: {
		processes: 1,
		service: 'pick_list',
		service_run_level: '2345',
		service_template_source: 'upstart-node_process.erb',
		bluepill_template_source: 'node_process-cluster.pill.erb',
		max_old_space: 2048,
		port: 7777,
		deploy_path: 'bin/rdk-pick-list-server.js',
		config_source: 'rdk-pick-list-server-config.json.erb',
		config_destination: "#{node[:rdk][:home_dir]}/config/rdk-pick-list-server-config",
		debug_port: 5878,
		max_sockets: '-1',
		nerve: {
			check_interval: 2,
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
	},
	activity_handler: {
		processes: nil, # will be overriden and calculated based on number of vx servers and handlers per each
		handlers_per_vx: 1,
		service: 'activity_handler',
		service_run_level: '2345',
		service_template_source: 'upstart-node_process.erb',
		bluepill_template_source: 'node_process-cluster.pill.erb',
		port: nil,
		deploy_path: 'bin/rdk-activity-handler.js',
		config_source: 'activity_handler.json.erb',
		config_destination: "#{node[:rdk][:home_dir]}/config/activity_handler",
		debug_port: 5888,
		max_sockets: '-1'
	},
	vista_aso_rejector: {
		processes: 1,
		service: 'vista_aso_rejector',
		service_run_level: '2345',
		service_template_source: 'upstart-node_process.erb',
		bluepill_template_source: 'node_process-cluster.pill.erb',
		port: 9200,
		deploy_path: 'bin/vista-aso-rejector.js',
		config_source: 'rdk-vista-aso-rejector-config.json.erb',
		config_destination: "#{node[:rdk][:home_dir]}/config/rdk-vista-aso-rejector-config",
		debug_port: 5898,
		max_sockets: '-1'
	}
}

default[:rdk][:jds_app_server_ident] = nil
