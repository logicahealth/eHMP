#
# Cookbook Name:: mocks
# Attributes:: das
#
#

default[:das][:vlerdas][:port] = 8891
default[:das][:vlerdas][:protocol] = "http"
default[:das][:vlerdas][:timeout] = 60000
default[:das][:vlerdas][:subscribe][:path] = "/HealthData/v1/Subscribe"
default[:das][:vlerdas][:read_doc_path][:path] = "/HealthData/v1/readDocument/DocumentReference"
default[:das][:vlerdas][:ping][:path] = "/ping"

