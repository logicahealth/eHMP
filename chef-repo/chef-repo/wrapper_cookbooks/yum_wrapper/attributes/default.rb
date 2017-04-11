#
# Cookbook Name:: vagrant_wrapper
# Attributes:: default
#
#

default['yum_wrapper']['localrepo']['name'] = "localrepo"
default['yum_wrapper']['localrepo']['baseurl'] = nil
default['yum_wrapper']['priorities_version'] = "1.1.30-37.el6.noarch"

override['yum']['main']['cachedir'] = '/var/chef/cache/yum'
override['yum']['main']['keepcache'] = true

