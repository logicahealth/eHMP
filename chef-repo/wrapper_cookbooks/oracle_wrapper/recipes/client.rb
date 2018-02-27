#
# Cookbook Name:: oracle_wrapper
# Recipe:: client
#
remote_file "#{Chef::Config[:file_cache_path]}/oracle-instantclient12.1-basic-12.1.0.2.0-1.x86_64.rpm" do
  source "http://nexus.osehra.org:8081/nexus/content/repositories/yum-managed/fakepath/oracle-instantclient12.1-basic/12.1.0.2.0-1.x86_64/oracle-instantclient12.1-basic-12.1.0.2.0-1.x86_64.rpm"
  action :create
end

remote_file "#{Chef::Config[:file_cache_path]}/oracle-instantclient12.1-devel-12.1.0.2.0-1.x86_64.rpm" do
  source "http://nexus.osehra.org:8081/nexus/content/repositories/yum-managed/fakepath/oracle-instantclient12.1-devel/12.1.0.2.0-1.x86_64/oracle-instantclient12.1-devel-12.1.0.2.0-1.x86_64.rpm"
  action :create
end

remote_file "#{Chef::Config[:file_cache_path]}/oracle-instantclient12.1-sqlplus-12.1.0.2.0-1.x86_64.rpm" do
  source "http://nexus.osehra.org:8081/nexus/content/repositories/yum-managed/fakepath/oracle-instantclient12.1-sqlplus/12.1.0.2.0-1.x86_64/oracle-instantclient12.1-sqlplus-12.1.0.2.0-1.x86_64.rpm"
  action :create
end

yum_package "oracle-instantclient12.1-basic" do
  source "#{Chef::Config[:file_cache_path]}/oracle-instantclient12.1-basic-12.1.0.2.0-1.x86_64.rpm"
  arch "x86_64"
  version node[:oracle_wrapper][:client][:version]
end

yum_package "oracle-instantclient12.1-devel" do
  source "#{Chef::Config[:file_cache_path]}/oracle-instantclient12.1-devel-12.1.0.2.0-1.x86_64.rpm"
  arch "x86_64"
  version node[:oracle_wrapper][:client][:version]
end

yum_package "oracle-instantclient12.1-sqlplus" do
  source "#{Chef::Config[:file_cache_path]}/oracle-instantclient12.1-sqlplus-12.1.0.2.0-1.x86_64.rpm"
  arch "x86_64"
  version node[:oracle_wrapper][:client][:version]
end

