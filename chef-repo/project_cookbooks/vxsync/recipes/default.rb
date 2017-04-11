#
# Cookbook Name:: vxsync
# Recipe:: default
#

include_recipe 'vxsync::base_line'

include_recipe 'vxsync::deploy_vxsync'

include_recipe 'vxsync::deploy_soap_handler'

include_recipe "vxsync::deploy_osync"
