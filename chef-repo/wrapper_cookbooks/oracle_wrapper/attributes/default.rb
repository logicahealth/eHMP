#
# Cookbook Name:: oracle_wrapper
# Attributes:: default
#

default[:oracle_wrapper][:user] = 'oracle'
default[:oracle_wrapper][:group] = 'oinstall'

default[:oracle][:user][:edb_item] = 'oracle_user_password'

default[:oracle][:rdbms][:install_files] = ["#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/oracle/oracle_linux_1/12.1.0.2/oracle_linux_1-12.1.0.2.zip",
                                            "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/oracle/oracle_linux_2/12.1.0.2/oracle_linux_2-12.1.0.2.zip"]

# use our own installation recipes instead of third party ones
default[:oracle][:rdbms][:is_installed] = true
default[:oracle][:rdbms][:latest_patch][:is_installed] = true

default[:oracle_wrapper][:dbs] = []

default[:oracle_wrapper][:client][:version] = "12.1.0.2.0-1"

default['oracle']['rdbms']['dbbin_version'] = '12c'
default['oracle']['oracle_gateway']['url'] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/oracle/oracle_gateways/12.1.0.2/oracle_gateways-12.1.0.2.zip"
default['oracle']['oracle_gateway']['config_dir'] = "/opt/ehmp-oracle/MSSQL"
default['oracle']['base'] = "#{node[:oracle][:ora_base]}"
default['oracle']['home'] = "#{node[:oracle][:rdbms][:ora_home_12c]}"
default['oracle']['oracle_gateway']['home'] = "#{node['oracle']['base']}"
default['oracle']['oracle_sid'] = "JBPMDB"
default['oracle']['group'] = "oinstall"
default['oracle']['swap'] = 2048

default[:oracle_wrapper][:memory_target] = 1157627904
default[:oracle_wrapper][:cpu_count] = 0
default[:oracle_wrapper][:cipher_suites] = "SSL_RSA_WITH_AES_128_CBC_SHA:SSL_RSA_WITH_AES_256_CBC_SHA"

default['oracle_wrapper']['oracle_env'] = {
  "ORACLE_HOME" => node['oracle']['rdbms']['ora_home_12c'],
  "ORACLE_SID" => node['oracle_wrapper']['dbs'][0],
  "PATH" => "#{node['oracle']['rdbms']['ora_home_12c']}/bin:#{ENV['PATH']}"
}
