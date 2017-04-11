#
# Cookbook Name:: mocks
# Attributes:: default
#
#

############################################
# jlv
############################################
default[:mocks][:chef_log] =     STDOUT

default[:mocks][:glassfish_url] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/oracle/glassfish/4.1/glassfish-4.1.zip"
default[:mocks][:sqlserver_jar_url] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/microsoft/sqljdbc4/2014.05.01/sqljdbc4-2014.05.01.jar"

default[:mocks][:jlv_url] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/gov/va/jlv/2.1.0.7.1/jlv-2.1.0.7.1.war"

default[:mocks][:jlv_old_url] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/gov/va/jlv/2.2.0.1/jlv-2.2.0.1-development.war"
default[:mocks][:jmeadows_url] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/gov/va/jmeadows/2.3.1.0/jmeadows-2.3.1.0-development.war"

default[:mocks][:vds_url] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/gov/va/vistadataservice/2.3.1/vistadataservice-2.3.1-development.war"

default[:mocks][:bhie_relay_url] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/gov/va/bhierelayservice/2.3.1/bhierelayservice-2.3.1-development.war"
default[:mocks][:mock_pdws_url] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/gov/va/mockpdws/1.0.0/mockpdws-1.0.0.war"
default[:mocks][:mock_mvi_url] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/gov/va/mockmvi/1.0.0/mockmvi-1.0.0.war"
default[:mocks][:mock_dod_adaptor_url] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/gov/va/mockdodadaptor/2.2.12/mockdodadaptor-2.2.12.war"
default[:mocks][:mock_vler_doc_query_url] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/gov/va/vlermockdocquery/1.0.8/vlermockdocquery-1.0.8.war"
default[:mocks][:mock_vler_doc_retrieve_url] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/gov/va/vlermockdocretrieve/1.0.6/vlermockdocretrieve-1.0.6.war"
default[:mocks][:mock_jmeadows_pdws_url] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/gov/va/mockjmeadowspdws/1.0.1/mockjmeadowspdws-1.0.1.war"


# glassfish attributes
default[:mocks][:admin_username] = "admin"
default[:mocks][:root_dir] = "/usr/local"
default[:mocks][:dir] = "/usr/local/glassfish4"
default[:mocks][:glassfish_application_dir] = "#{node[:mocks][:dir]}/glassfish/domains/domain1/applications"
default[:mocks][:glassfish_autodeploy_dir] = "#{node[:mocks][:dir]}/glassfish/domains/domain1/autodeploy"

# war file names
default[:mocks][:jmeadows_name] = "jMeadows"
default[:mocks][:bhie_relay_service_name] = "BHIERelayService"
default[:mocks][:dod_adaptor_name] = "MockDoDAdaptor"
default[:mocks][:jlv_name] = "JLV"
default[:mocks][:jlv_old_name] = "JLV_OLD"
default[:mocks][:mvi_name] = "MockMVI"
default[:mocks][:pdws_name] = "MockPDWS"
default[:mocks][:mock_jmeadows_pdws_name] = "MockJMeadowsPDWS"
default[:mocks][:vds_name]  = "VistaDataService"
default[:mocks][:vler_doc_query_name] = "VLERMockDocQuery"
default[:mocks][:vler_doc_retrieve_name] = "VLERMockDocRetrieve"

# application urls
default[:mocks][:jmeadows_ip] = "127.0.0.1"
default[:mocks][:jlv_ip] = "127.0.0.1"
default[:mocks][:sql_server_ip] = "127.0.0.1"
default[:mocks][:bhie_relay_service_url] = "http://#{node[:mocks][:jmeadows_ip]}/BHIERelayService/BHIERelayService?WSDL"
default[:mocks][:bhie_end_point] = "http://#{node[:mocks][:jmeadows_ip]}/MockDoDAdaptor"
default[:mocks][:jmeadows_application_url] = "http://#{node[:mocks][:jmeadows_ip]}/jMeadows/JMeadowsDataService?WSDL"
default[:mocks][:vds_application_url] = "http://#{node[:mocks][:jmeadows_ip]}/VistaDataService/VistaDataService?WSDL"
default[:mocks][:pdws_url] = "http://#{node[:mocks][:jlv_ip]}/MockPDWS/PDWSService?WSDL"
default[:mocks][:pdwsret_url] = "http://#{node[:mocks][:jlv_ip]}/MockPDWS/EntityPatientRetrieve?WSDL"
default[:mocks][:mvi_url] = "http://#{node[:mocks][:jlv_ip]}/MockMVI/MVIService?WSDL"
default[:mocks][:vler_doc_query_url] = "http://#{node[:mocks][:jmeadows_ip]}/VLERMockDocQuery/NHINAdapterGatewayDocQuery/EntityDocQuery?WSDL"
default[:mocks][:vler_doc_retrieve_url] = "http://#{node[:mocks][:jmeadows_ip]}/VLERMockDocRetrieve/NHINAdapterGatewayDocRetrieve/EntityDocRetrieve?WSDL"
default[:mocks][:mock_jmeadows_pdws_endpoint] = "http://#{node[:mocks][:jlv_ip]}/MockJMeadowsPDWS/EntityPatientRetrieve?WSDL"

# domain.xml attritubtes
default[:mocks][:domain_xml_maxpermsize] = "-XX:MaxPermSize=512m"
default[:mocks][:domain_xml_xmx] = "-Xmx1024m"

############################################
# node mocks services
############################################
default[:mocks][:node_services][:source] = nil # options the uri should be either https://some.thing.com/stuff... or file:///path/to/artifact.ext
default[:mocks][:node_services][:filename] = "node_mock_services"
default[:mocks][:node_services][:checksum] = nil
default[:mocks][:node_services][:service] = "mocks_server"

default[:mocks][:node_services][:artifact_path] = "#{Chef::Config['file_cache_path']}/#{node[:mocks][:node_services][:filename]}"
default[:mocks][:node_services][:home_dir] = "/opt/#{node[:mocks][:node_services][:service]}"
default[:mocks][:node_services][:log_dir] = "#{node[:mocks][:node_services][:home_dir]}/logs"
default[:mocks][:fqdn] = "mock.vistacore.us"
default[:mocks][:ajp][:port] = "8896"
default[:mocks][:node_services][:libxml_rebuild_dir] = "#{node[:mocks][:node_services][:home_dir]}/node_modules/libxmljs"

