#
# Cookbook Name:: activity_handler
# Recipe:: default
#

include_recipe 'nodejs_wrapper'
include_recipe 'nodejs_wrapper::node_6_dev_tools' if system("mountpoint -q #{node[:activity_handler][:home_dir]}")
include_recipe 'bluepill_wrapper'

yum_package "libaio"

include_recipe 'oracle_wrapper::client'

yum_package "unzip"

include_recipe 'apm' if node[:activity_handler][:enable_apm]

include_recipe 'app_dynamics' if node[:activity_handler][:enable_app_dynamics]

user node[:activity_handler][:user]

group node[:activity_handler][:group] do
  members node[:activity_handler][:user]
  action :create
end

include_recipe 'activity_handler::logrotate'
include_recipe 'activity_handler::set_processes'
include_recipe 'activity_handler::service'
include_recipe 'ehmp_synapse'
include_recipe 'activity_handler::install'
include_recipe 'activity_handler::config'
include_recipe 'activity_handler::tools_activities'

include_recipe 'vista_aso_rejector::default'
