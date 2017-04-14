#
# Cookbook Name:: workstation
# Recipe:: rhel
#

include_recipe "nokogiri_wrapper"

# Already installed!
#include_recipe "chef-dk_wrapper"

include_recipe "java_wrapper"

include_recipe "gradle_wrapper"

# Done manually--Google moved URL
#include_recipe "phantomjs_wrapper"

# Already installed
#include_recipe "workstation::git"

include_recipe "build-essential"

include_recipe "xvfb_wrapper"

include_recipe "nodejs_wrapper"

include_recipe "workstation::install_packages"

execute "correct ownership of gem home" do
	command "chown -R #{node[:workstation][:user]} #{node[:workstation][:user_home]}/Projects/vistacore/.gems"
end

# Don't know what that is
#include_recipe 'oracle_wrapper::client'

# We are not slaves!
#include_recipe "workstation::slave_config"

#include_recipe 'virtualbox_wrapper'
#node.default[:vagrant_wrapper][:home] = "#{node[:workstation][:user_home]}/Projects/vistacore/.vagrant.d"
#include_recipe 'vagrant_wrapper'
#include_recipe 'vagrant_wrapper::windows_plugin'
