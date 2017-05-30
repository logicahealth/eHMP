#
# Cookbook Name:: jds
# Recipe:: default
#

# Check version of currently installed cache-server package
existing_version = `ccontrol qlist #{node[:jds][:cache_service]} | cut -d^ -f3`.chomp
node.normal[:jds][:rpm_cache_package] = `rpm -qa | grep -i #{node[:jds][:cache_service]}`.chomp

# Determine whether a clean install is necessary
if existing_version.empty? || !node[:jds][:rpm_cache_package].empty? || existing_version != node[:jds][:cache_version]
  node.normal[:jds][:build_jds] = true
end

gem_package 'greenletters'

if node[:jds][:install_cache] == true
  include_recipe 'jds::cache'
  include_recipe 'jds::config'
  include_recipe 'jds::routines'
else 
  include_recipe 'jds::gtm_install'
  include_recipe 'jds::gtm_jds_config'
end

include_recipe 'jds::networking'
