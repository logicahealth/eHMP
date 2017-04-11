#
# Cookbook Name:: ehmp-ui_provision
# Recipe:: artifacts
#

include_recipe 'machine'

machine_artifacts "ehmp-ui_provision" do
  action :download
end
