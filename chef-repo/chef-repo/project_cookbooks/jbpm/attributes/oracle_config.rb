#
# Cookbook Name:: jbpm
# Recipe:: default
#

default[:jbpm][:oracle_config][:port] = "1521"
default[:jbpm][:oracle_config][:connector_source] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/oracle/ojdbc6/11.2.0.2/ojdbc6-11.2.0.2.jar"
default[:jbpm][:oracle_config][:sql_config_dir] = "/tmp/sql_config"
default[:jbpm][:oracle_config][:refresh_view_minutes] = "5"

default['jbpm']['sql_users']['jbpm_username'] = "JBPM"
default['jbpm']['sql_users']['pcmm_username'] = "PCMM"
default['jbpm']['sql_users']['activitydb_username'] = "ACTIVITYDB"
default['jbpm']['sql_users']['activitydbuser_username'] = "activitydbuser"
default['jbpm']['sql_users']['notifdb_username'] = "NOTIFDB"
default['jbpm']['sql_users']['sdsadm_username'] = "SDSADM"
default['jbpm']['sql_users']['mssql_username'] = "ORACLEUSER"
