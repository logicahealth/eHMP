#
# Cookbook Name:: cdsinvocation_provision
# Recipe:: artifacts
#

include_recipe 'machine'

machine_artifacts "cds_provision" do
  action :download
end
