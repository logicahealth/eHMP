#
# Cookbook Name:: jbpm
# Recipe:: default
#

default[:jbpm][:install][:admin_user] = "bpmsAdmin"
default[:jbpm][:install][:source] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/jboss/bpmsuite/6.1.0.GA/bpmsuite-6.1.0.GA-installer.jar"
