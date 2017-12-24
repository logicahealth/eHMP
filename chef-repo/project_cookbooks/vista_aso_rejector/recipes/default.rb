#
# Cookbook Name:: vista_aso_rejector
# Recipe:: default
#

user node[:vista_aso_rejector][:user]

group node[:vista_aso_rejector][:group] do
  members node[:vista_aso_rejector][:user]
  action :create
end

include_recipe 'vista_aso_rejector::install'
include_recipe 'vista_aso_rejector::service'
