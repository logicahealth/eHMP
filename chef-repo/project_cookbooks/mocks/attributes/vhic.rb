#
# Cookbook Name:: mocks
# Attributes:: vhic
#
#

default[:vhic][:port] = 8896
default[:vhic][:protocol] = "http"
default[:vhic][:sender_code] = "200EHMP"
default[:vhic][:search_path] = "/vhic"
default[:vhic][:sync_path] = "/vhic"
default[:vhic][:agent_options][:key] = nil
default[:vhic][:agent_options][:reject_unauthorized] = nil
default[:vhic][:agent_options][:cert] = nil
default[:vhic][:agent_options][:request_cert] = nil
default[:vhic][:agent_options][:ca] = nil
default[:vhic][:agent_options][:passphrase] = nil
default[:vhic][:agent_options][:max_sockets] = 5
