#
# Cookbook Name:: solr
# Attributes:: default
#
# Copyright 2016, Vistacore
#

default[:solr][:version]  = '5.1.0'
default[:solr][:url]      = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/apache/solr/#{node[:solr][:version]}/solr-#{node[:solr][:version]}.tgz"
default[:solr][:data_dir] = "#{node[:solr][:dir]}-#{node[:solr][:version]}/server/solr"
default[:solr][:install_java] = false
default[:solr][:java_options] = ""
