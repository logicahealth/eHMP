#
# Cookbook Name:: vxsync
# Recipe:: default
#

include_recipe 'vxsync::base_line'

include_recipe 'vxsync::deploy_vxsync'

include_recipe 'vxsync::deploy_soap_handler'

include_recipe 'vxsync::asu_base_line'

include_recipe 'vxsync::asu_service_control'

include_recipe 'vxsync::deploy_asu'

include_recipe "vxsync::deploy_osync"
