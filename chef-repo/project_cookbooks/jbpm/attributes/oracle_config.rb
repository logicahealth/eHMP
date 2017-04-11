#
# Cookbook Name:: jbpm
# Recipe:: default
#

default[:jbpm][:oracle_config][:port] = "1521"
default[:jbpm][:oracle_config][:connector_source] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/oracle/ojdbc6/11.2.0.2/ojdbc6-11.2.0.2.jar"
