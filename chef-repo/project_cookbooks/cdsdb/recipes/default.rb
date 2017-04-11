#
# Cookbook Name:: opencds
# Recipe:: default
#

include_recipe "mongodb-wrapper"

include_recipe "cdsdb::configure_cdsdb"
