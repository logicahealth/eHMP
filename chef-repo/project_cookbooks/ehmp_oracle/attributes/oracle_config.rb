#
# Cookbook Name:: ehmp_oracle
# Attributes:: oracle_config
#

default['ehmp_oracle']['oracle_config']['port'] = '1521'
default['ehmp_oracle']['oracle_config']['refresh_view_minutes'] = '1440'
default['ehmp_oracle']['oracle_config']['replicate_pcmm_schedule_repeat_interval'] = 'freq=daily'
default['ehmp_oracle']['oracle_config']['sql_config_dir'] = '/opt/ehmp-oracle/sql_config'
default['ehmp_oracle']['oracle_config']['sql_dir'] = '/opt/ehmp-oracle/sql'
default['ehmp_oracle']['oracle_config']['test_data_dir'] = '/opt/ehmp-oracle/sql/test-data'
default['ehmp_oracle']['oracle_config']['log_dir'] = '/var/log/ehmp-oracle'
default['ehmp_oracle']['oracle_config']['log_file'] = '/var/log/ehmp-oracle/install.log'
default['ehmp_oracle']['oracle_config']['utils_dir'] = "/opt/ehmp-oracle/sql/utils"
default['ehmp_oracle']['oracle_config']['utils_tmp_dir'] = "/opt/ehmp-oracle/sql/utils/tmp"

default['ehmp_oracle']['oracle_config']['dbf_dir'] = "/oradata"
default['ehmp_oracle']['oracle_config']['tablespaces'] = {
  'ACTIVITY_DATA' => {
    'file' => 'activity01.dbf' ,
    'size' => '256M',
    'extent' => '256M'
  },
  'ACTIVITY_X' => {
    'file' => 'activityx01.dbf' ,
    'size' => '256M',
    'extent' => '256M'
  },
  'NOTIF_DATA' => {
    'file' => 'notif01.dbf' ,
    'size' => '256M',
    'extent' => '256M'
  },
  'NOTIF_X' => {
    'file' => 'notifx01.dbf' ,
    'size' => '256M',
    'extent' => '256M'
  },
  'PCMM_DATA' => {
    'file' => 'pcmm01.dbf' ,
    'size' => '256M',
    'extent' => '256M'
  },
  'PCMM_X' => {
    'file' => 'pcmmx01.dbf' ,
    'size' => '256M',
    'extent' => '256M'
  },
  'SDSADM_DATA' => {
    'file' => 'sdsadm01.dbf' ,
    'size' => '256M',
    'extent' => '256M'
  },
  'SDSADM_X' => {
    'file' => 'sdsadmx01.dbf' ,
    'size' => '256M',
    'extent' => '256M'
  },
  'COMM_DATA' => {
    'file' => 'comm01.dbf' ,
    'size' => '256M',
    'extent' => '256M'
  },
  'COMM_X' => {
    'file' => 'commx01.dbf' ,
    'size' => '256M',
    'extent' => '256M'
  },
  'EHMP_DATA' => {
    'file' => 'ehmp01.dbf' ,
    'size' => '256M',
    'extent' => '256M'
  },
  'EHMP_X' => {
    'file' => 'ehmpx01.dbf' ,
    'size' => '256M',
    'extent' => '256M'
  }
}

#
# Oracle Users
# user attributes:
#   [data_bag] DEFAULT "credentials"
#   [data_bag_item] DEFAULT "oracle_user_#{item.name}"
#   [data_bag_username_attr] DEFAULT "username" || [username] DEFAULT "#{item.name}"
#   [data_bag_password_attr] DEFAULT "password"
#   [tablespace]
#   [index_tablespace]
#   user_type
#     DBA - provisioned with DBA role
#     APPLICATION - provisioned as application user
#     SCHEMA_OWNER - provisioned as schema owner with create object permissions
#   [deprecate] true or false - drop user if exists
#

default['ehmp_oracle']['oracle_config']['users'] = {
  'sys' => {
    'data_bag' => 'credentials',
    'data_bag_item' => 'oracle_user_sys',
    'user_type' => 'DBA'
  },
  'jbpm' => {
    'data_bag' => 'credentials',
    'data_bag_item' => 'oracle_user_jbpm',
    'user_type' => 'DBA'
  },
  'activitydb' => {
    'data_bag' => 'credentials',
    'data_bag_item' => 'oracle_user_activitydb',
    'tablespace' => 'ACTIVITY_DATA',
    'index_tablespace' => 'ACTIVITY_X',
    'user_type' => 'SCHEMA_OWNER'
  },
  'activitydbuser' => {
    'data_bag' => 'credentials',
    'data_bag_item' => 'oracle_activitydbuser_password',
    'username' => 'activitydbuser',
    'user_type' => 'APPLICATION',
    'deprecate' => true
  },
  'notifdb' => {
    'data_bag' => 'credentials',
    'data_bag_item' => 'oracle_user_notifdb',
    'tablespace' => 'NOTIF_DATA',
    'index_tablespace' => 'NOTIF_X',
    'user_type' => 'SCHEMA_OWNER'
  },
  'pcmm' => {
    'data_bag' => 'credentials',
    'data_bag_item' => 'oracle_user_pcmm',
    'tablespace' => 'PCMM_DATA',
    'index_tablespace' => 'PCMM_X',
    'user_type' => 'SCHEMA_OWNER'
  },
  'sdsadm' => {
    'data_bag' => 'credentials',
    'data_bag_item' => 'oracle_user_sdsadm',
    'tablespace' => 'SDSADM_DATA',
    'index_tablespace' => 'SDSADM_X',
    'user_type' => 'SCHEMA_OWNER'
  },
  'communication' => {
    'data_bag' => 'credentials',
    'data_bag_item' => 'oracle_user_communication',
    'tablespace' => 'COMM_DATA',
    'index_tablespace' => 'COMM_X',
    'user_type' => 'SCHEMA_OWNER'
  },
  'communicationuser' => {
    'data_bag' => 'credentials',
    'data_bag_item' => 'oracle_user_communicationuser',
    'user_type' => 'APPLICATION',
    'deprecate' => true
  },
  'ehmp' => {
    'data_bag' => 'credentials',
    'data_bag_item' => 'oracle_user_ehmp',
    'tablespace' => 'EHMP_DATA',
    'index_tablespace' => 'EHMP_X',
    'user_type' => 'SCHEMA_OWNER'
  },
  'ehmpuser' => {
    'data_bag' => 'credentials',
    'data_bag_item' => 'oracle_user_ehmpuser',
    'user_type' => 'APPLICATION'
  }
}
