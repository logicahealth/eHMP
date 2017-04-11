#
# Cookbook Name:: workstation
# Recipe:: gradle_win
#
# Copyright 2016, Medicasoftllc
#
# All rights reserved - Do Not Redistribute
#

node.default['workstation']['gradle_win']['source'] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/program/gradle/gradle/#{node['workstation']['gradle_win']['version']}/gradle-#{node['workstation']['gradle_win']['version']}-bin.zip"

gradledir = node['workstation']['gradle_win']['dir']
file_name = "gradle-#{node['workstation']['gradle_win']['version']}-bin.zip"
dest_file = File.join(Chef::Config[:file_cache_path], file_name)

directory gradledir do
  mode "0755"
  action :create
end

remote_file dest_file do
  source node['workstation']['gradle_win']['source']
  use_conditional_get true
  not_if {File.exists?("#{gradledir}/gradle-#{node['workstation']['gradle_win']['version']}/bin/gradle.bat")}
end

execute "uzip_gradle" do
  command "jar -xf \"#{dest_file}\""
  cwd gradledir
  creates "#{gradledir}/gradle-#{node['workstation']['gradle_win']['version']}/bin/gradle.bat"
  action :run
end

directory gradledir do
  mode "0755"
  recursive true
end

env "GRADLE_HOME" do
    value "#{gradledir}/gradle-#{node['workstation']['gradle_win']['version']}"
    not_if "ENV['GRADLE_HOME'] == #{gradledir}/gradle-#{node['workstation']['gradle_win']['version']}"
end

env "PATH" do
  delim ";"
  value '%GRADLE_HOME%/bin'
  action :modify
  not_if "ENV['GRADLE_HOME']"
end

# execute 'gradle_permissions' do
#   command "chmod -R 0755 #{gradledir}/gradle-#{node['workstation']['gradle_win']['version']}/"
#   action :run
# end


