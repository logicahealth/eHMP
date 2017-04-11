#
# Cookbook Name:: opencds
# Recipe:: default
#

include_recipe 'java_wrapper'
include_recipe 'opencds::tomcat'
include_recipe 'opencds::deploy_knowledge_repo'
include_recipe 'opencds::configure_war'
include_recipe 'opencds::deploy_war'
include_recipe 'opencds::deploy_cds_engine_agent'
