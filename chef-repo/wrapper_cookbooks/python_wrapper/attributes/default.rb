#
# Cookbook Name:: python_wrapper
# Attributes:: default
#
#

default['python']['install_method'] = 'source'

default['python']['version'] = '2.7.5'
default['python']['checksum'] = '8e1b5fa87b91835afb376a9c0d319d41feca07ffebc0288d97ab08d64f48afbf'
default['python']['url'] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/python/"
