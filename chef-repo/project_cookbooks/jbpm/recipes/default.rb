#
# Cookbook Name:: jbpm
# Recipe:: default
#

include_recipe "jboss-eap_wrapper"
include_recipe "jbpm::install"
include_recipe "jbpm::oracle_config"
include_recipe "jbpm::configure"
