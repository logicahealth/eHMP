#
# Cookbook Name:: mocks
# Attributes:: jmeadows
#

##########################################################################
# jMeadows attributes for vxsync to find
##########################################################################
default[:jmeadows][:version] = "2.3.3.0.2"
default[:jmeadows][:application][:protocol] = "http"
default[:jmeadows][:application][:port] = 80
default[:jmeadows][:application][:path] = "/jMeadows/JMeadowsDataService"
default[:jmeadows][:application][:path_query] = "wsdl"
default[:jmeadows][:application][:user][:ien] = "20012"
default[:jmeadows][:application][:user][:name] = "VEHU, TEN"
default[:jmeadows][:application][:user][:site_code] = 200
default[:jmeadows][:application][:user][:site_name] = "CAMP MASTER"

##########################################################################
# attributes used by mocks::jmeadows to deploy the application 
##########################################################################
default[:mocks][:jmeadows][:artifacts] = { 
  "VLERMockDocQuery" => "#{node[:nexus_url]}/nexus/content/repositories/filerepo/gov/va/vlermockdocquery/1.0.8/vlermockdocquery-1.0.8.war",
  "VLERMockDocRetrieve" => "#{node[:nexus_url]}/nexus/content/repositories/filerepo/gov/va/vlermockdocretrieve/1.0.6/vlermockdocretrieve-1.0.6.war",
  "MockJMeadowsPDWS" => "#{node[:nexus_url]}/nexus/content/repositories/filerepo/gov/va/mockjmeadowspdws/1.0.1/mockjmeadowspdws-1.0.1.war",
  "jMeadows" => "#{node[:nexus_url]}/nexus/content/repositories/filerepo/gov/va/jmeadows/#{node[:jmeadows][:version]}/jmeadows-#{node[:jmeadows][:version]}-development.war",
  "BHIERelayService" => "#{node[:nexus_url]}/nexus/content/repositories/filerepo/gov/va/bhierelayservice/#{node[:jmeadows][:version]}/bhierelayservice-#{node[:jmeadows][:version]}-development.war",
  "MockDoDAdaptor" => "#{node[:nexus_url]}/nexus/content/repositories/filerepo/gov/va/mockdodadaptor/2.2.13/mockdodadaptor-2.2.13.war",
  "VistaDataService" => "#{node[:nexus_url]}/nexus/content/repositories/filerepo/gov/va/vistadataservice/#{node[:jmeadows][:version]}/vistadataservice-#{node[:jmeadows][:version]}-development.war"
}
default[:mocks][:jmeadows][:bhie_relay_endpoint] = "http://127.0.0.1/BHIERelayService/BHIERelayService?WSDL"
default[:mocks][:jmeadows][:dod_adaptor_endpoint] = "http://127.0.0.1/MockDoDAdaptor"
default[:mocks][:jmeadows][:vds_endpoint] = "http://127.0.0.1/VistaDataService/VistaDataService?WSDL"
default[:mocks][:jmeadows][:pwds_endpoint] = "http://127.0.0.1/MockJMeadowsPDWS/EntityPatientRetrieve?WSDL"
