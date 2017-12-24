#
# Cookbook Name:: pick_list
# Recipe:: default
#

include_recipe 'nodejs_wrapper'
include_recipe 'nodejs_wrapper::node_6_dev_tools' if system("mountpoint -q #{node[:pick_list][:home_dir]}")
include_recipe 'bluepill_wrapper'

yum_package "libaio"

include_recipe 'oracle_wrapper::client'

yum_package "unzip"

include_recipe 'apm' if node[:pick_list][:enable_apm]
include_recipe 'app_dynamics' if node[:pick_list][:enable_app_dynamics]

user node[:pick_list][:user]

group node[:pick_list][:group] do
  members node[:pick_list][:user]
  action :create
end

include_recipe 'pick_list::logrotate'
include_recipe 'pick_list::service'
include_recipe 'ehmp_synapse'
include_recipe 'pick_list::install'

include_recipe 'nerve_wrapper'

include_recipe 'pick_list::config'

include_recipe 'vista_aso_rejector::default'
