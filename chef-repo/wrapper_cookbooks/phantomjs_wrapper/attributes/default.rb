#
# Cookbook Name:: phantomjs_wrapper
# Attributes:: default
#
#

default['phantomjs']['version'] = '2.1.1'
default['phantomjs']['base_url'] = "https://nexus.osehra.org:8444/nexus/content/repositories/filerepo/third-party/program/phantom/phantomjs/#{node['phantomjs']['version']}"
default['phantomjs']['basename'] = "phantomjs-#{node['phantomjs']['version']}-#{node['kernel']['machine']}"
