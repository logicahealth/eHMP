#
# Cookbook Name:: jbpm
# Recipe:: default
#

default[:jbpm][:home] = "#{node['jboss-eap']['install_path']}/#{node['jboss-eap']['symlink']}/standalone"
default[:jbpm][:gitdir] = "/home/jboss"
default[:jbpm][:oracle_jdbc] = "com.oracle.ojdbc6"
default[:jbpm][:m2_home] = "/home/jboss/.m2"
default[:jbpm][:organization] = "VistaCore"
