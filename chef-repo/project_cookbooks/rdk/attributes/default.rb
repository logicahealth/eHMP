#
# Cookbook Name:: rdk
# Recipe:: default
#

default[:rdk][:protocol] = "http"
default[:rdk][:source] = nil
default[:rdk][:ccow_service] = "ccow"
default[:rdk][:home_dir] = '/opt/rdk'
default[:rdk][:ccow_dir] = '/opt/ccow'
default[:rdk][:config][:xml_path] = "#{node[:rdk][:home_dir]}/src/resources/patient-search/xml/"
default[:rdk][:log_dir] = "/var/rdk/logs"
default[:rdk][:audit_log_path] = "#{node[:rdk][:log_dir]}/audit.log"
default[:rdk][:audit_host] = "IP_ADDRESS"
default[:rdk][:audit_port] = "9200"
default[:rdk][:complex_note_port] = "8080"
default[:rdk][:node_dev_home]= "/usr/local/bin/"
default[:rdk][:cookie_prefix] = "ehmp.vistacore"
default[:rdk][:oracledb_module][:version] = '1.9.3'
default[:rdk][:write_dir] = "#{node[:rdk][:home_dir]}/src/write"
# some common default attributes for jdsSync/reSyncs
default[:rdk][:jdsSync][:settings][:waitMillis] = 1000
default[:rdk][:jdsSync][:settings][:timeoutMillis] = 420000
default[:rdk][:jdsSync][:settings][:syncExistsWaitDelayMillis] = 30000
default[:rdk][:resync][:openJobsTimeoutMillis] = 21600000
default[:rdk][:resync][:inProgressTimeoutMillis] = 86400000
default[:rdk][:resync][:inactivityTimeoutMillis] = 86400000
default[:rdk][:resync][:lastSyncMaxIntervalMillis] = 600000


default[:rdk][:services] = {
	fetch_server: {
		processes: 1,
		service: "fetch_server",
		service_run_level: "2345",
		service_template_source: "upstart-node_process.erb",
		bluepill_template_source: "node_process-cluster.pill.erb",
		port: 8888,
		deploy_path: "bin/rdk-fetch-server.js",
		config_source: "rdk-fetch-server-config.json.erb",
		config_destination: "#{node[:rdk][:home_dir]}/config/rdk-fetch-server-config",
		debug_port: 5858,
		max_sockets: "-1"
	},
	write_back: {
		processes: 1,
		service: "write_back",
		service_run_level: "2345",
		service_template_source: "upstart-node_process.erb",
		bluepill_template_source: "node_process-cluster.pill.erb",
		port: 9999,
		deploy_path: "bin/rdk-write-server.js",
		config_source: "rdk-write-server-config.json.erb",
		config_destination: "#{node[:rdk][:home_dir]}/config/rdk-write-server-config",
		debug_port: 5868,
		max_sockets: "-1"
	},
	pick_list: {
		processes: 1,
		service: "pick_list",
		service_run_level: "2345",
		service_template_source: "upstart-node_process.erb",
		bluepill_template_source: "node_process-cluster.pill.erb",
		port: 7777,
		deploy_path: "bin/rdk-pick-list-server.js",
		config_source: "rdk-pick-list-server-config.json.erb",
		config_destination: "#{node[:rdk][:home_dir]}/config/rdk-pick-list-server-config",
		debug_port: 5878,
		max_sockets: "-1"
	},
	activity_handler: {
		processes: 1,
		service: "activity_handler",
		service_run_level: "2345",
		service_template_source: "upstart-node_process.erb",
		bluepill_template_source: "node_process-cluster.pill.erb",
		port: 0,
		deploy_path: "bin/subscriberHost.js",
		config_source: "activity_handler.json.erb",
		config_destination: "#{node[:rdk][:home_dir]}/config/activity_handler",
		debug_port: nil,
		max_sockets: "-1"
	}
}