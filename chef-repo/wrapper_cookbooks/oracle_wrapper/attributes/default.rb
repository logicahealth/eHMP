#
# Cookbook Name:: oracle_wrapper
# Attributes:: default
#

default[:oracle][:user][:edb_item] = 'oracle_user_password'

# default[:oracle][:rdbms][:install_files] = ["#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/oracle/oracle_linux_1/11.2.0.1/oracle_linux_1-11.2.0.1.zip",
#                                             "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/oracle/oracle_linux_2/11.2.0.1/oracle_linux_2-11.2.0.1.zip"]
default[:oracle][:rdbms][:install_files] = ["file:///opt/private_licenses/oracle/linux.x64_11gR2_database_1of2.zip", "file:///opt/private_licenses/oracle/linux.x64_11gR2_database_2of2.zip"] 
# third party cookbook does not support the versions of the files above, so we set these
#   attributes to true to prevent the third party cookbook's installation recipes from running
default[:oracle][:rdbms][:is_installed] = true
default[:oracle][:rdbms][:latest_patch][:is_installed] = true

default[:oracle_wrapper][:dbs] = []

default[:oracle_wrapper][:client][:version] = "11.2.0.1.0-1"