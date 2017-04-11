#
# Cookbook Name:: jbpm
# Recipe:: default
#

# The attribute evaluates to either
# oracle_wrapper or oracle-xe_wrapper
# 
# Set by jbpm recipe in rdk_provision
if ::File.exists?("/etc/oratab")
  include_recipe "#{node[:jbpm][:oracle_cookbook]}::env_vars"
else
  include_recipe "#{node[:jbpm][:oracle_cookbook]}"
end

include_recipe "jboss-eap_wrapper"
include_recipe "jbpm::install"
include_recipe "jbpm::oracle_config"
include_recipe "jbpm::configure"
