#
# Cookbook Name:: vista_aso_rejector
# Recipe:: default
#

default[:vista_aso_rejector][:user] = 'node'
default[:vista_aso_rejector][:group] = 'node'
default[:vista_aso_rejector][:source] = nil
default[:vista_aso_rejector][:home_dir] = '/opt/vista_aso_rejector'
default[:vista_aso_rejector][:log_dir] = '/var/log/vista_aso_rejector'
default[:vista_aso_rejector][:pid_dir] = '/var/run/vista_aso_rejector'

default[:vista_aso_rejector][:tls_reject_unauthorized] = 0

default[:vista_aso_rejector][:uv_threadpool_size] = 4


default[:vista_aso_rejector][:service_config] = {
	name: 'vista_aso_rejector',
	service_run_level: '2345',
	service_template_source: 'upstart-node_process.erb',
	bluepill_template_source: 'node_process-cluster.pill.erb',
	deploy_path: 'bin/vista-aso-rejector.js',
	source: 'vista-aso-rejector-config.json.erb',
	destination: "#{node[:vista_aso_rejector][:home_dir]}/config/rdk-vista-aso-rejector-config",
	debug_port: 5898,
	max_sockets: '5'
}
