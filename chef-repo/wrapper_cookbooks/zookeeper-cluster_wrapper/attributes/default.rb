#
# Cookbook: zookeeper-cluster_wrapper
#
# Copyright 2016, Vistacore
#

default['zookeeper-cluster']['service']['version'] = '3.4.8'
default['zookeeper-cluster']['service']['binary_checksum'] = 'f10a0b51f45c4f64c1fe69ef713abf9eb9571bc7385a82da892e83bb6c965e90'
default['zookeeper-cluster']['service']['binary_url'] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/apache/zookeeper/3.4.8/zookeeper-3.4.8.tar.gz"
