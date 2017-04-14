#
# Cookbook Name:: oracle_wrapper
# Attributes:: default
#

default[:oracle][:user][:edb_item] = 'oracle_user_password'

default[:oracle][:rdbms][:install_files] = ["#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/oracle/oracle_linux_1/11.2.0.4/oracle_linux_1-11.2.0.4.zip",
                                            "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/oracle/oracle_linux_2/11.2.0.4/oracle_linux_2-11.2.0.4.zip"]

# third party cookbook does not support the versions of the files above, so we set these
#   attributes to true to prevent the third party cookbook's installation recipes from running
default[:oracle][:rdbms][:is_installed] = true
default[:oracle][:rdbms][:latest_patch][:is_installed] = true

default[:oracle_wrapper][:dbs] = []

default[:oracle_wrapper][:client][:version] = "12.1.0.2.0-1"

default['oracle']['oracle_gateway']['url'] = "#{node[:nexus_url]}/nexus/content/groups/public/third-party/project/oracle/linux.x64_11gR2_gateways/1.0/linux.x64_11gR2_gateways-1.0.zip"
default['oracle']['oracle_gateway']['config_dir'] = "/tmp/MSSQL"
default['oracle']['base'] = "#{node[:oracle][:ora_base]}"
default['oracle']['home'] = "#{node[:oracle][:rdbms][:ora_home]}"
default['oracle']['oracle_gateway']['home'] = "#{node['oracle']['base']}"
default['oracle']['oracle_sid'] = "JBPMDB"
default['oracle']['group'] = "oinstall"
default['oracle']['swap'] = 2048

default[:oracle_wrapper][:memory_target] = 1157627904
default[:oracle_wrapper][:cpu_count] = 0
