#
# Cookbook Name:: workstation
# Recipe:: windows
#
# Copyright 2016, Medicasoft
#
# All rights reserved - Do Not Redistribute

ENV['WORKSPACE'] = "#{node[:workstation][:user_home]}/Projects/vistacore"
#ENV['GEM_HOME'] = node[:workstation][:windows_gem_dir]
#ENV['GEM_PATH'] = "#{ENV['GEM_HOME']};#{ENV['GEM_PATH']}"
# ENV['PATH'] = "c:/opscode/chefdk/embedded/bin;#{ENV['GEM_HOME']}/bin;#{ENV['PATH']}"
ENV['PATH'] = "c:/opscode/chefdk/embedded/bin;#{ENV['GEM_HOME']}/bin;#{ENV['PATH']}"

include_recipe 'workstation::chef_config'
#include_recipe 'homebrew' #Nope, works only for MacOs. Chocolatey or Scoop?
include_recipe 'chocolatey'

include_recipe 'workstation::java_win'

include_recipe 'workstation::python_win'

include_recipe 'workstation::gradle_win'

include_recipe 'workstation::groovy_win'

include_recipe 'workstation::phantomjs_win'

include_recipe 'virtualbox_wrapper'

include_recipe "workstation::git_win"

include_recipe 'build-essential'

include_recipe 'firefox'

include_recipe 'chrome'

include_recipe 'workstation::nodejs_win'

node.default[:vagrant_wrapper][:home] = "#{node[:workstation][:user_home]}/Projects/vistacore/.vagrant.d"
include_recipe 'vagrant_wrapper'

#do we realy need it?
#include_recipe 'vagrant_wrapper::windows_plugin'

include_recipe "workstation::install_packages_win"

#not needed on windows
# include_recipe 'workstation::correct_package_ownership'

#must have .bat files ready
include_recipe 'workstation::workspace_scripts'