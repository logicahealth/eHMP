#
# Cookbook Name:: rdk_provision
# Recipe:: artifacts
#

include_recipe 'machine'

machine_artifacts "rdk_provision" do
  action :download
end
