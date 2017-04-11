#
# Cookbook Name:: mocks
# Attributes:: mvi
#
#

default[:mvi][:port] = 8896
default[:mvi][:protocol] = "http"
default[:mvi][:sender_code] = "200EHMP"
default[:mvi][:search_path] = "/mvi"
default[:mvi][:sync_path] = "/mvi"
default[:mvi][:wsdl_path] = "MockMVI/psim_webservice/IdMWebService?wsdl"
default[:mvi][:processing_code] = "T"
default[:mvi][:agent_options][:key] = nil
default[:mvi][:agent_options][:reject_unauthorized] = nil
default[:mvi][:agent_options][:cert] = nil
default[:mvi][:agent_options][:request_cert] = nil
default[:mvi][:agent_options][:ca] = nil
default[:mvi][:agent_options][:passphrase] = nil
