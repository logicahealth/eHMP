#
# Cookbook Name:: activity_handler
# Recipe:: default
#

default[:activity_handler][:user] = 'node'
default[:activity_handler][:group] = 'node'
default[:activity_handler][:protocol] = 'http'
default[:activity_handler][:source] = nil
default[:activity_handler][:version] = 'DEVELOPMENT'
default[:activity_handler][:home_dir] = '/opt/activity_handler'
default[:activity_handler][:config][:xml_path] = "#{node[:activity_handler][:home_dir]}/src/resources/patient-search/xml"
default[:activity_handler][:log_dir] = '/var/log/activity_handler'
default[:activity_handler][:pid_dir] = '/var/run/activity_handler'
default[:activity_handler][:audit_log_path] = "#{node[:activity_handler][:log_dir]}/audit.log"
default[:activity_handler][:audit_host] = 'IP        '
default[:activity_handler][:audit_port] = 'PORT'
default[:activity_handler][:complex_note_port] = 'PORT'
default[:activity_handler][:node_dev_home]= '/usr/local/bin/'
default[:activity_handler][:cookie_prefix] = 'ehmp.vistacore'
default[:activity_handler][:tls_reject_unauthorized] = 0
default[:activity_handler][:oracledb_module][:version] = '1.12.2'

# Note the interactions between the oracle_connection_pool minimum and the uv_threadpool_size
# The uv_threadpool_size sets the number of threads to be utilized by a node process to handle async requests.
# The uv_threadpool_size should be at least as big as the connection pool, up to a maximum of 128
# See https://github.com/oracle/node-oracledb/blob/master/doc/api.md#numberofthreads
#
# Also be aware that uv_threadpool_size is not just related to Oracle connection pools, it can affect other aysnc
# operations as well, particularly those involving native code modules.
# However, documentation is sparse and online reading conflicting so it is unclear if filesystem  and general network operations
# are affected.  Adding to confusion is the strategies have changed under different node releases.
default[:activity_handler][:oracle_connection_pool][:minimum] = '0'
default[:activity_handler][:oracle_connection_pool][:maximum] = '4'
default[:activity_handler][:uv_threadpool_size] = 4
default[:activity_handler][:write_dir] = "#{node[:activity_handler][:home_dir]}/src/write"
default[:activity_handler][:activity_handler_ops_scripts_dir] = '/opt/activities-cli'

# log levels
default[:activity_handler][:log_level][:activity_handler] = 'warn'

# activity handler attributes
default[:activity_handler][:activityManagementJobRetryLimit] = 5

# Worker Count Configurations
default[:activity_handler][:worker_count] = 1
default[:activity_handler][:beanstalk][:jobTypes][:'activity-management-event'][:worker_count] = 1
default[:activity_handler][:beanstalk][:jobTypes][:'activity-management-event'][:delay] = 30
default[:activity_handler][:beanstalk][:jobTypes][:'error-request'][:worker_count] = 1

# ehmp-config
## feature flag attributes
default[:activity_handler][:trackSolrStorage] = true

## settings attributes
default[:activity_handler][:settings][:solrIndexingDelayMillis] = 3000

# APM attirbutes
default[:activity_handler][:enable_apm] = false
default[:activity_handler][:apm][:probe_name] = "activity_handler"

# app_dynamics attributes
default[:activity_handler][:enable_app_dynamics] = false
default[:activity_handler][:app_dynamics][:agent_tier_name] = "activity_handler"

default[:activity_handler][:incidents][:root_directory] = '/var/incidents'

default[:activity_handler][:logrotate][:name] = 'activity_handler_logs'
default[:activity_handler][:logrotate][:path] = "#{node[:activity_handler][:log_dir]}/*.log"
default[:activity_handler][:logrotate][:rotate] = 10
default[:activity_handler][:logrotate][:options] = %w{missingok compress delaycompress copytruncate notifempty dateext}
default[:activity_handler][:logrotate][:frequency] = 'daily'
default[:activity_handler][:logrotate][:dateformat] = '-%Y%m%d%s'

default[:activity_handler][:logrotate][:incidents][:name] = 'ehmp_incident_logs'
default[:activity_handler][:logrotate][:incidents][:path] = "#{node[:activity_handler][:incidents][:root_directory]}/*/eHMP-IR-*.txt"
default[:activity_handler][:logrotate][:incidents][:rotate] = 10
default[:activity_handler][:logrotate][:incidents][:options] = %w{missingok compress delaycompress dateext}
default[:activity_handler][:logrotate][:incidents][:frequency] = 'daily'
default[:activity_handler][:logrotate][:incidents][:dateformat] = '-%Y%m%d%s'

default[:activity_handler][:service_config] = {
	processes: nil, # will be overriden and calculated based on number of vx servers and handlers per each
	handlers_per_vx: 1,
	name: 'activity_handler',
	service_run_level: '2345',
	service_template_source: 'upstart-node_process.erb',
	bluepill_template_source: 'node_process-cluster.pill.erb',
	port: nil,
	deploy_path: 'bin/rdk-activity-handler.js',
	source: 'activity_handler.json.erb',
	destination: "#{node[:activity_handler][:home_dir]}/config/activity_handler",
	debug_port: 5888,
	max_sockets: '5'
}

default[:activity_handler][:jds_app_server_assignment] = nil
