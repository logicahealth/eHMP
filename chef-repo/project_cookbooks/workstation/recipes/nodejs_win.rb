#
# Cookbook Name:: workstation
# Recipe:: nodejs_win
#
# Copyright 2016, Medicasoftllc
#
# All rights reserved - Do Not Redistribute

windows_package "NodeJs-Installer" do
	version node["workstation"]["nodejs_win"]["version"] 
	source node["workstation"]["nodejs_win"]["url"]
	checksum node["workstation"]["nodejs_win"]["checksum"]
	installer_type :custom
	options '/quiet'
	action :install
end
