#
# Cookbook Name:: jena_fuseki
# Recipe:: base_line
#

user node[:crs][:user]

group node[:crs][:group] do
  members node[:crs][:user]
  action :create
end

include_recipe "java_wrapper"
