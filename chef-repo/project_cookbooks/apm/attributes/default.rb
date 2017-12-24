#
# Cookbook Name:: apm
# Recipe:: default
#

# APM attirbutes
default[:apm][:agent][:version] = "10.2.0"
default[:apm][:agent][:path] = "/opt/CollectorAgent"
default[:apm][:agent][:source] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/ca/collectoragent/#{node[:apm][:agent][:version]}/collectoragent-#{node[:apm][:agent][:version]}-unix.tar"
default[:apm][:agent][:host] = "localhost"
default[:apm][:agent][:port] = "5001"
default[:apm][:host] = "localhost"
default[:apm][:port] = "5005"
