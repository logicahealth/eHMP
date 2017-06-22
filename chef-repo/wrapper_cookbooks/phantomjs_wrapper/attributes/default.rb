#
# Cookbook Name:: phantomjs_wrapper
# Attributes:: default
#
#

default[:nexus_url] = "http://nexus.osehra.org:8081"
default['phantomjs']['version'] = '2.1.1'
default['phantomjs']['base_url'] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/phantom/phantomjs/#{node['phantomjs']['version']}"
default['phantomjs']['basename'] = "phantomjs-#{node['phantomjs']['version']}-#{node['kernel']['machine']}"
