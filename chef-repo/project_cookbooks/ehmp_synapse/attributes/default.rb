#
# Cookbook Name:: ehmp_synapse
# Attributes:: default
#

default['ehmp_synapse']['haproxy_stats_creds_db'] = 'haproxy_stats'

default['synapse']['services'] = {
  'pick_list' => {
    'haproxy' => {
      'port' => 27_777,
      'server_options' => 'check inter 2s rise 3 fall 2',
      'listen' => [
        'mode http',
        'option httpchk GET /resource/write-pick-list/version',
        'http-check expect status 200',
        'timeout check 45s'
      ]
    }
  },
  'fetch_server' => {
    'haproxy' => {
      'port' => 28_888,
      'server_options' => 'check inter 2s rise 3 fall 2',
      'listen' => [
        'mode http',
        'option httpchk GET /resource/version',
        'http-check expect status 200',
        'timeout check 45s'
      ]
    }
  },
  'write_back' => {
    'haproxy' => {
      'port' => 29_999,
      'server_options' => 'check inter 2s rise 3 fall 2',
      'listen' => [
        'mode http',
        'option httpchk GET /resource/write-health-data/version',
        'http-check expect status 200',
        'timeout check 45s'
      ]
    }
  },
  'vxsync_sync' => {
    'haproxy' => {
      'port' => 21_111,
      'server_options' => 'check inter 2s rise 3 fall 2',
      'listen' => [
        'mode http',
        'option httpchk GET /ping',
        'http-check expect status 200'
      ]
    }
  },
  'vxsync_write_back' => {
    'haproxy' => {
      'port' => 21_112,
      'server_options' => 'check inter 2s rise 3 fall 2',
      'listen' => [
        'mode http',
        'option httpchk GET /ping',
        'http-check expect status 200'
      ]
    }
  },
  'asu' => {
    'haproxy' => {
      'port' => 21_113,
      'server_options' => 'port 8081 check inter 10s rise 3 fall 2',
      'listen' => [
        'mode http',
        'option httpchk GET /health',
        'http-check expect string {"status":"UP"}'
      ]
    }
  },
  'jbpm' => {
    'haproxy' => {
      'port' => 21_114,
      'server_options' => 'check inter 45s rise 3 fall 2',
      'listen' => [
        'mode http',
        'option httpchk GET /business-central/kie-wb.html',
        'http-check expect status 200'
      ]
    }
  },
  "cdsinvocation" => {
		"haproxy" => {
			"port" => 21_115,
			"server_options" => "check inter 10s rise 3 fall 2",
			"listen" => [
				"mode http",
				"option httpchk GET /cds-results-service/rest/healthcheck",
				"http-check expect status 200"
			]
		}
	}
}
