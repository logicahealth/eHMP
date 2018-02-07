#
# Cookbook Name:: jds
# Recipe:: jds
#

gem_package 'greenletters'

if node[:jds][:install_cache] == true
  include_recipe 'jds::cache'
  include_recipe 'jds::config'
  include_recipe 'jds::create_namespace'
  include_recipe 'jds::cache_map'
  include_recipe 'jds::zstu_ro'
  include_recipe 'jds::jds_ro'
else
  include_recipe 'jds::gtm_install'
  include_recipe 'jds::gtm_jds_config'
end

include_recipe 'jds::vprjconfig'
include_recipe 'jds::restart'
include_recipe 'jds::networking'
include_recipe 'jds::jds_data_stores'
