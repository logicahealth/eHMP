#
# Cookbook Name:: opencds
# Recipe:: tomcat
#

node.normal["tomcat"]["jmx_opts"] = [
	"-Dcom.sun.management.jmxremote=true", 
	"-Dcom.sun.management.jmxremote.port=#{node[:opencds][:jmx][:port]}", 
	"-Dcom.sun.management.jmxremote.authenticate=false", 
	"-Dcom.sun.management.jmxremote.ssl=false", 
	"-Djava.rmi.server.hostname=#{node['ipaddress']}"
]

include_recipe 'tomcat'
