#
# Cookbook Name:: workstation
# Recipe:: java_win
#
# Copyright 2016, Medicasoftllc
#
# All rights reserved - Do Not Redistribute

node.default["workstation"]["java_win"]["url"] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp-win/filerepo/third-party/project/oracle/jdk/8u77/jdk-8u77-x64.exe"



windows_package "JavaWin-Installer (x64)" do 
	source node["workstation"]["java_win"]["url"]
	checksum node["workstation"]["java_win"]["checksum"]
	installer_type :custom
	options '/s'
	action :install
	not_if { File.directory? node["workstation"]["java_win"]["java_home"] }
end

env "JAVA_HOME" do
    value node["workstation"]["java_win"]["java_home"]
    not_if "ENV['JAVA_HOME'] == node['workstation']['java_win']['java_home']"
end

env "PATH" do
  delim ";"
  value '%JAVA_HOME%/bin'
  action :modify
  not_if "ENV['JAVA_HOME']"
end
