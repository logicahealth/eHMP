#
# Cookbook Name:: ehmp_provision
# Recipe:: artifacts
#

include_recipe 'machine'

machine_artifacts "ehmp_provision" do
  action :download
end
