#
# Cookbook Name:: oracle-xe_wrapper
# Attributes:: default
#

default['oracle-xe']['url'] = "#{node[:nexus_url]}/nexus/content/repositories/yum-managed/fakepath/oracle-xe/11.2.0-1.0.x86_64/oracle-xe-11.2.0-1.0.x86_64.rpm"
default['oracle-xe']['oracle_gateway']['url'] = "#{node[:nexus_url]}/nexus/content/groups/public/third-party/project/oracle/linux.x64_11gR2_gateways/1.0/linux.x64_11gR2_gateways-1.0.zip"
default['oracle-xe']['oracle_gateway']['config_dir'] = "/tmp/MSSQL"
default['oracle-xe']['base'] = "/u01/app/oracle"
default['oracle-xe']['home'] = "#{node['oracle-xe']['base']}/product/11.2.0/xe"
default['oracle-xe']['oracle_gateway']['home'] = "#{node['oracle-xe']['base']}/product"
default['oracle-xe']['oracle_sid'] = "XE"
default['oracle-xe']['group'] = "dba"
default['oracle-xe']['ora_inventory']="/u01/app/oraInventory"