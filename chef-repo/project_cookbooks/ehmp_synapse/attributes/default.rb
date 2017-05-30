#
# Cookbook Name:: ehmp_synapse
# Attributes:: default
#

default['ehmp_synapse']['haproxy_stats_creds_db'] = "haproxy_stats"

default['synapse']['services'] = {
	"pick_list" => {
    "haproxy" => {
      "port" => 27777,
      "server_options" => "check inter 2s rise 3 fall 2",
      "listen" => [
        "mode http",
        "option httpchk GET /resource/write-pick-list/version",
        "http-check expect status 200",
        "timeout check 45s"
      ]
    }
  },
  "fetch_server" => {
    "haproxy" => {
      "port" => 28888,
      "server_options" => "check inter 2s rise 3 fall 2",
      "listen" => [
        "mode http",
        "option httpchk GET /resource/version",
        "http-check expect status 200"
      ]
    }
  },
  "write_back" => {
    "haproxy" => {
      "port" => 29999,
      "server_options" => "check inter 2s rise 3 fall 2",
      "listen" => [
        "mode http",
        "option httpchk GET /resource/write-health-data/version",
        "http-check expect status 200"
      ]
    }
  }
}
