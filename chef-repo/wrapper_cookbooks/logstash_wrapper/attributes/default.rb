#
# Cookbook Name:: rubygems_wrapper
# Attributes:: default
#


default['logstash']['instance_default']['source_url'] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/elastic/logstash/1.4.2/logstash-1.4.2.tar.gz"
