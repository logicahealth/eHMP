#
# Cookbook Name:: workstation
# Recipe:: mac_os_x
#

ENV['WORKSPACE'] = "#{node[:workstation][:user_home]}/Projects/vistacore"
ENV['GEM_HOME'] = node[:workstation][:osx_gem_dir]
ENV['GEM_PATH'] = "#{ENV['GEM_HOME']}:#{ENV['GEM_PATH']}"
ENV['PATH'] = "/opt/chefdk/embedded/bin:#{ENV['GEM_HOME']}/bin:#{ENV['PATH']}"

# include_recipe 'chef-dk_wrapper'

include_recipe 'workstation::chef_config'

include_recipe 'homebrew'

include_recipe 'workstation::java_osx'

include_recipe 'workstation::gradle_osx'

include_recipe 'workstation::phantomjs_osx'

include_recipe 'virtualbox_wrapper'

include_recipe "workstation::git"

include_recipe 'build-essential'

include_recipe 'chrome'

include_recipe 'workstation::nodejs_osx'

node.default[:vagrant_wrapper][:home] = "#{node[:workstation][:user_home]}/Projects/vistacore/.vagrant.d"
include_recipe 'vagrant_wrapper'

include_recipe "workstation::install_packages_osx"

include_recipe 'workstation::correct_package_ownership'

include_recipe 'workstation::workspace_scripts'
