#
# Cookbook Name:: phantomjs_wrapper
# Attributes:: default
#
#

default['phantomjs']['version'] = '2.1.1'
default['phantomjs']['base_url'] = "#{node[:nexus_url]}/repositories/ehmp/filerepo/third-party/program/phantom/phantomjs/#{node['phantomjs']['version']}"
default['phantomjs']['basename'] = "phantomjs-#{node['phantomjs']['version']}-#{node['kernel']['machine']}"
