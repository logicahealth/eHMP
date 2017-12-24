#
# Cookbook Name:: jbpm
# Recipe:: default
#

# The attribute evaluates to either
# oracle_wrapper or oracle-xe_wrapper
#
# Set by jbpm recipe in rdk_provision

include_recipe 'jboss-eap_wrapper'
include_recipe 'jbpm::set_oracle_env' unless ::File.exist?('/etc/oratab')
include_recipe 'jbpm::install'
include_recipe 'jbpm::oracle_config'
include_recipe 'jbpm::configure'
include_recipe 'jbpm::nerve'
