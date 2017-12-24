#
# Cookbook Name:: cdsinvocation
# Recipe:: default
#

default[:cdsinvocation][:fqdn] = "cdsinvocation.vistacore.us"

default[:cdsinvocation][:import_cert][:trust_store] = "#{node[:tomcat][:home]}/shared/classes/certs/mongoStore.ts"
default[:cdsinvocation][:import_cert][:store_pass_db] = "store_pass"
default[:cdsinvocation][:import_cert][:alias] = "mongoStore"
default[:cdsinvocation][:ssl_files][:data_bags][:public_ca_db] = "root_ca"
default[:cdsinvocation][:deploy_intents] = true

node.normal["tomcat"]["more_opts"] = ["-Djavax.net.ssl.trustStorePassword=#{node[:cdsinvocation][:import_cert][:store_pass]}", "-Djavax.net.ssl.trustStore=#{node[:cdsinvocation][:import_cert][:trust_store]}"]

# Logging
default['tomcat']['logging']['sizeBasedTriggeringPolicy'] = "50MB"
default['tomcat']['logging']['defaultRolloverStrategy'] = "10"

default[:cdsinvocation][:nerve] = {
  :check_interval => 30,
  :checks => [
		{
			type: "http",
			uri: "/cds-results-service/rest/healthcheck",
			timeout: 5,
			rise: 3,
			fall: 2
		}
	]
}
