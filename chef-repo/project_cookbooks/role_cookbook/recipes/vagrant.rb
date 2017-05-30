#
# Cookbook Name:: role_cookbook
# Recipe:: vagrant
#

node.default[:development] = true

include_recipe "ohai"
include_recipe "timezone-ii"
include_recipe "ntp"

swap_file "local_swap" do
	path "/local.swap"
	size 12288
	action :create
end

package "nss" do
  action :upgrade
end