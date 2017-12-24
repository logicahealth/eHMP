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

default['yum_wrapper']['vistacore']['name'] = 'vistacore'
default['yum_wrapper']['vistacore']['baseurl'] = nil
default['yum_wrapper']['vistacore']['gpgkey'] = 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-6'
default['yum_wrapper']['vistacore']['reponame'] = nil
