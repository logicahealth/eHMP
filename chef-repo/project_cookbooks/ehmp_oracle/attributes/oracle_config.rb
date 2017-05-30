#
# Cookbook Name:: ehmp_oracle
# Attributes:: oracle_config
#

default['ehmp_oracle']['oracle_config']['jbpm_username'] = 'JBPM'
default['ehmp_oracle']['oracle_config']['activitydb_username'] = 'ACTIVITYDB'
default['ehmp_oracle']['oracle_config']['activitydbuser_username'] = 'activitydbuser'
default['ehmp_oracle']['oracle_config']['notifdb_username'] = 'NOTIFDB'
default['ehmp_oracle']['oracle_config']['pcmm_username'] = 'PCMM'
default['ehmp_oracle']['oracle_config']['sdsadm_username'] = 'SDSADM'

default['ehmp_oracle']['oracle_config']['port'] = '1521'
default['ehmp_oracle']['oracle_config']['refresh_view_minutes'] = '5'
default['ehmp_oracle']['oracle_config']['mssql_username'] = 'ORACLEUSER'
default['ehmp_oracle']['oracle_config']['sql_config_dir'] = '/tmp/sql_config'
