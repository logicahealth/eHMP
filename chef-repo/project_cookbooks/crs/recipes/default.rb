#
# Cookbook Name:: jena_fuseki
# Recipe:: default
#

include_recipe "crs::base_line"
include_recipe "crs::fuseki"
include_recipe "crs::deploy_crs"
include_recipe "crs::deploy_third_party"
