#
# Cookbook Name:: cdsinvocation
# Recipe:: default
#

default[:cdsinvocation][:fqdn] = "cdsinvocation.vistacore.us"

default[:cdsinvocation][:deploy_artifacts][:properties_dir] = "#{node[:tomcat][:user_home]}/.cdsinvocation"
default[:cdsinvocation][:deploy_artifacts][:properties_file] = "#{node[:cdsinvocation][:deploy_artifacts][:properties_dir]}/cdsinvocation.properties"
