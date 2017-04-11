#
# Cookbook Name:: vagrant_wrapper
# Attributes:: default
#
#

default['yum_wrapper']['localrepo']['name'] = "localrepo"
default['yum_wrapper']['localrepo']['baseurl'] = nil

override['yum']['main']['cachedir'] = '/var/chef/cache/yum'
override['yum']['main']['keepcache'] = true

