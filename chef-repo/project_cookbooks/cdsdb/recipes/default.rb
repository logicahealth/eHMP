#
# Cookbook Name:: cdsdb
# Recipe:: default
#

include_recipe "cdsdb::ssl_files" 

include_recipe "mongodb-wrapper"

include_recipe 'cdsdb::user_management'

include_recipe 'cdsdb::cdsdb_logrotate'
