#
# Cookbook Name:: oracle_wrapper
# Recipe:: client
#

yum_package "oracle-instantclient12.1-basic" do
  arch "x86_64"
  version node[:oracle_wrapper][:client][:version]
end

yum_package "oracle-instantclient12.1-devel" do
  arch "x86_64"
  version node[:oracle_wrapper][:client][:version]
end
