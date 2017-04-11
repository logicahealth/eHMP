#
# Cookbook Name:: oracle-xe_wrapper
# Attributes:: default
#

default['oracle-xe']['url'] = "#{node[:nexus_url]}/nexus/content/repositories/yum-managed/fakepath/oracle-xe/11.2.0-1.0.x86_64/oracle-xe-11.2.0-1.0.x86_64.rpm"
