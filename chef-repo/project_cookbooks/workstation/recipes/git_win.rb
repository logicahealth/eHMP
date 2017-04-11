#
# Cookbook Name:: workstation
# Recipe:: gradle_win
#
# Copyright 2016, Medicasoftllc
#
# All rights reserved - Do Not Redistribute
#

node.default['git']['version'] 		= '2.8.1'
node.default['git']['url']		   	= "#{node[:nexus_url]}/nexus/service/local/repositories/ehmp-win/content/filerepo/third-party/program/git/git/2.8.1/git-2.8.1-x64.exe"
node.default['git']['checksum']	    = '5e5283990cc91d1e9bd0858f8411e7d0afb70ce26e23680252fb4869288c7cfb'
node.default['git']['display_name'] = "Git version #{ node['git']['version'] }"
node.default['git']['classifier']	= 'x64'

include_recipe 'git'

execute "git config --global push.default simple"