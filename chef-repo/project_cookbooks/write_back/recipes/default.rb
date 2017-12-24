#
# Cookbook Name:: write_back
# Recipe:: default
#

include_recipe 'nodejs_wrapper'
include_recipe 'nodejs_wrapper::node_6_dev_tools' if system("mountpoint -q #{node[:write_back][:home_dir]}")
include_recipe 'bluepill_wrapper'


yum_package "libaio"

include_recipe 'oracle_wrapper::client'

yum_package "unzip"

include_recipe 'apm' if node[:write_back][:enable_apm]
include_recipe 'app_dynamics' if node[:write_back][:enable_app_dynamics]

user node[:write_back][:user]

group node[:write_back][:group] do
  members node[:write_back][:user]
  action :create
end

include_recipe 'write_back::logrotate'
include_recipe 'write_back::service'
include_recipe 'ehmp_synapse'
include_recipe 'write_back::install'

include_recipe 'nerve_wrapper'

include_recipe 'write_back::config'

include_recipe 'vista_aso_rejector::default'
