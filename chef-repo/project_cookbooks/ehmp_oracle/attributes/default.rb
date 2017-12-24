#
# Cookbook Name:: ehmp_oracle
# Attributes:: default
#

default['ehmp_oracle']['oracle_sid'] = 'JBPMDB'
default['ehmp_oracle']['oracle_service'] = 'oracle'
default['ehmp_oracle']['swap']['include_swap'] = nil

default['ehmp_oracle']['base_dir'] = '/opt/ehmp-oracle'

default['ehmp_oracle']['upgrade_scripts_dir'] = "#{node['ehmp_oracle']['base_dir']}/oracle_upgrade"

default['ehmp_oracle']['patch']['version'] = '25901056'
default['ehmp_oracle']['patch']['source'] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/oracle/oracle_patch/#{node['ehmp_oracle']['patch']['version']}/oracle_patch-#{node['ehmp_oracle']['patch']['version']}.zip"
default['ehmp_oracle']['patch']['database_folder'] = '25755742'
default['ehmp_oracle']['patch']['javavm_folder'] = '26027162'
default['ehmp_oracle']['opatch']['version'] = '12.2.0.1.9'
default['ehmp_oracle']['opatch']['source'] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/oracle/oracle_opatch/#{node['ehmp_oracle']['opatch']['version']}/oracle_opatch-#{node['ehmp_oracle']['opatch']['version']}.zip"
