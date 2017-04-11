#
# Cookbook Name:: mocks
# Attributes:: vler
#
#

default[:vler][:protocol] = "http"
default[:vler][:port] = 80
default[:vler][:doc_query][:protocol] = "http"
default[:vler][:doc_query][:path] = "/VLERMockDocQuery/NHINAdapterGatewayDocQuery/EntityDocQuery"
default[:vler][:doc_query][:path_query] = "wsdl"
default[:vler][:doc_query][:timeout] = 45000
default[:vler][:doc_retrieve][:protocol] = "http"
default[:vler][:doc_retrieve][:path] = "/VLERMockDocRetrieve/NHINAdapterGatewayDocRetrieve/EntityDocRetrieve"
default[:vler][:doc_retrieve][:path_query] = "wsdl"
default[:vler][:doc_retrieve][:timeout] = 45000
default[:vler][:system_user_name] = "ehmp"
default[:vler][:system_site_code] = "200"
