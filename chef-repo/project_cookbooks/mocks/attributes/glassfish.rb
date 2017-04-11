#
# Cookbook Name:: mocks
# Attributes:: glassfish
#

default[:mocks][:glassfish][:service] = 'glassfish'
default[:mocks][:glassfish][:server_admin] = "admin"
default[:mocks][:glassfish][:user] = 'root'
default[:mocks][:glassfish][:group] = 'root'
default[:mocks][:glassfish][:source] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/oracle/glassfish/4.1/glassfish-4.1.zip"
default[:mocks][:glassfish][:home] = '/usr/local/glassfish4'
default[:mocks][:glassfish][:asadmin] = "#{node[:mocks][:glassfish][:home]}/glassfish/bin/asadmin"
default[:mocks][:glassfish][:domain_dir] = "#{node[:mocks][:glassfish][:home]}/glassfish/domains"
default[:mocks][:glassfish][:application_dir] = "#{node[:mocks][:glassfish][:domain_dir]}/domain1/applications"
default[:mocks][:glassfish][:autodeploy_dir] = "#{node[:mocks][:glassfish][:domain_dir]}/domain1/autodeploy"
default[:mocks][:glassfish][:sql_jdbc_url] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/microsoft/sqljdbc4/2014.05.01/sqljdbc4-2014.05.01.jar"
default[:mocks][:glassfish][:max_perm_size] = "-XX:MaxPermSize=512m"
default[:mocks][:glassfish][:domain_xmx] = "-Xmx1024m"