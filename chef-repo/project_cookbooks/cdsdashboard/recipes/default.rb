#
# Cookbook Name:: cdsdashboard
# Recipe:: default
#

include_recipe "java_wrapper"

include_recipe "tomcat"

include_recipe "cdsdashboard::apache2_config"

include_recipe "cdsdashboard::deploy_war"

include_recipe "cdsdashboard::configure_war"
