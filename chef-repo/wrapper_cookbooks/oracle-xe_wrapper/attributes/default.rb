#
# Cookbook Name:: oracle-xe_wrapper
# Attributes:: default
#

# default['oracle-xe']['url'] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/yum-managed/fakepath/oracle-xe/11.2.0-1.0.x86_64/oracle-xe-11.2.0-1.0.x86_64.rpm"
default['oracle-xe']['url'] = "file:///opt/private_licenses/oracle/oracle-xe-11.2.0-1.0.x86_64.rpm"
default['oracle-xe']['oracle-password'] = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", 'n25q2mp#h4')["password"]
