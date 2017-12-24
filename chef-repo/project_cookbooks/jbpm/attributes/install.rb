#
# Cookbook Name:: jbpm
# Recipe:: default
#

default[:jbpm][:install][:source] = "#{node[:nexus_url]}/nexus/service/local/repositories/filerepo/content/third-party/project/jboss/bpmsuite/6.3.0.GA/bpmsuite-6.3.0.GA-installer.jar"
default[:jbpm][:install][:patch9] = "#{node[:nexus_url]}/nexus/service/local/repositories/filerepo/content/third-party/project/jboss/jboss-eap/6.4.9/jboss-eap-6.4.9-patch.zip"
default[:jbpm][:install][:patch14] = "#{node[:nexus_url]}/nexus/service/local/repositories/filerepo/content/third-party/project/jboss/jboss-eap/6.4.14/jboss-eap-6.4.14-patch.zip"
default[:jbpm][:install][:bpmpatch634] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/jboss/jboss-bpmsuite/6.3.4/jboss-bpmsuite-6.3.4-patch.zip"
default[:jbpm][:install][:bpmpatch615] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/jboss/jboss-bpmsuite/6.1.5/jboss-bpmsuite-6.1.5-patch.zip"
default[:jbpm][:install][:bpmpatch615630] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/jboss/jboss-bpmsuite/6.1.5-to-6.3.0/jboss-bpmsuite-6.1.5-to-6.3.0-patch.zip"
default[:jbpm][:install][:jboss_config][:java_xmx]=""
default[:jbpm][:install][:jboss_config][:java_xms]="-Xms1303m"
