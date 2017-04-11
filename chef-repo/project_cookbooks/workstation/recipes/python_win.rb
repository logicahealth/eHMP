#
# Cookbook Name:: workstation
# Recipe:: python_win
#
# Copyright 2016, Medicasoftllc
#
# All rights reserved - Do Not Redistribute

node.default["workstation"]["python_win"]["url"] = "#{node[:nexus_url]}/nexus/service/local/repositories/ehmp-win/content/filerepo/third-party/program/python/python/2.7.11/python-2.7.11-x64.msi"

windows_package "PythonWin-Installer (x64)" do 
	source node["workstation"]["python_win"]["url"]
	checksum node["workstation"]["python_win"]["checksum"]
	installer_type :custom
	options '/quiet'
	action :install
	not_if { File.directory? node["workstation"]["python_win"]["python_home"] }
end

env "PYTHON_HOME" do
    value node["workstation"]["python_win"]["python_home"]
    not_if "ENV['PYTHON_HOME'] == node['workstation']['python_win']['python_home']"
end

env "PATH" do
  delim ";"
  value '%PYTHON_HOME%'
  action :modify
  not_if "ENV['PYTHON_HOME']"
end
