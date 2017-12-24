#
# Cookbook Name:: fetch_server
# Recipe:: default
#

include_recipe 'nodejs_wrapper'
include_recipe 'nodejs_wrapper::node_6_dev_tools' if system("mountpoint -q #{node[:fetch_server][:home_dir]}")
include_recipe 'bluepill_wrapper'

yum_package "libaio"

include_recipe 'oracle_wrapper::client'

yum_package "unzip"

include_recipe 'apm' if node[:fetch_server][:enable_apm]
include_recipe 'app_dynamics' if node[:fetch_server][:enable_app_dynamics]

user node[:fetch_server][:user]

group node[:fetch_server][:group] do
  members node[:fetch_server][:user]
  action :create
end

include_recipe 'fetch_server::logrotate'
include_recipe 'fetch_server::service'
include_recipe 'ehmp_synapse'
include_recipe 'fetch_server::install'

include_recipe 'nerve_wrapper'

include_recipe 'fetch_server::config'
include_recipe 'fetch_server::config_ssl'

include_recipe 'vista_aso_rejector::default'

include_recipe 'communications_cli'
