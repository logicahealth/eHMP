#
# Cookbook Name:: nodejs_wrapper
# Recipe:: default
#

include_recipe "nodejs"

directory node[:nodejs_wrapper][:node_path] do
  mode 0755
  recursive true
end
