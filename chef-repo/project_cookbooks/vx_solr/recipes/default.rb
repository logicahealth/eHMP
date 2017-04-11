#
# Cookbook Name:: vx_solr
# Recipe:: default
#

# upgrade if /opt/solr* exists but /opt/solr-[VERSION]/server does not
if !Dir.exists? node[:vx_solr][:server_dir] and !Dir.glob('/opt/solr*').empty?
  include_recipe 'vx_solr::prepare_upgrade'
  include_recipe 'solr_wrapper'
  include_recipe 'vx_solr::finish_upgrade'
else
  include_recipe 'solr_wrapper'
end

include_recipe 'vx_solr::ecryptfs'
include_recipe 'vx_solr::service'
include_recipe 'vx_solr::ehmp'
