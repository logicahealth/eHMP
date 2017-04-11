#
# Cookbook Name:: mocks
# Attributes:: vix
#
#
default[:vix][:port] = 8099
default[:vix][:protocol] = "http"

default[:vix][:agent_options][:pfx] = nil
default[:vix][:agent_options][:reject_unauthorized] = nil
default[:vix][:agent_options][:request_cert] = nil
default[:vix][:agent_options][:passphrase] = nil
