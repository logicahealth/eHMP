#
# Cookbook Name:: synapse
# Attributes:: default
#

default['synapse']['user'] = 'synapse'
default['synapse']['home'] = '/opt/synapse'
default['synapse']['install_dir'] = '/opt/synapse'
default['synapse']['version'] = '0.14.6'
default['synapse']['haproxy']['version'] = '1.5.4-3.el6'
default['synapse']['executable'] = "#{node['synapse']['home']}/bin/synapse"
default['synapse']['config_file'] = "#{node['synapse']['home']}/synapse.conf.json"
default['synapse']['remote_services_dir'] = "/nerve/services"
default['synapse']['services'] = {}

default['synapse']['haproxy'] = {
	'global' => {
		'maxconn' => 2000,
		'nbproc' => 1
	},
	'defaults' => [
		"log      global",
		"option   dontlognull",
		"maxconn  2000",
		"retries  3",
		"timeout  connect 5s",
		"timeout  client  1m",
		"timeout  server  1m",
		"option   redispatch",
		"balance  roundrobin"
    ],
	'extra_sections' => {
		'stats' => {
			'host' => '0.0.0.0',
			'port' => 3212,
			'auth' => 'admin:password',
			'uri' => '/',
			'refresh' => '5s'
		}
	}
}

default['synapse']['logrotate']['path'] = "/var/log/synapse.*"
default['synapse']['logrotate']['rotate'] = 10
default['synapse']['logrotate']['options'] = %w{missingok compress delaycompress copytruncate notifempty dateext}
default['synapse']['logrotate']['frequency'] = 'daily'
default['synapse']['logrotate']['dateformat'] = '-%Y%m%d%s'
