#
# Cookbook Name:: workstation
# Recipe:: gradle_osx
#

node.default['workstation']['gradle_osx']['source'] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/program/gradle/gradle/#{node['workstation']['gradle_osx']['version']}/gradle-#{node['workstation']['gradle_osx']['version']}-bin.zip"

gradledir = node['workstation']['gradle_osx']['dir']
file_name = "gradle-#{node['workstation']['gradle_osx']['version']}-bin.zip"
dest_file = File.join(Chef::Config[:file_cache_path], file_name)

directory gradledir do
  mode "0755"
  action :create
end

remote_file dest_file do
  source node['workstation']['gradle_osx']['source']
  use_conditional_get true
  not_if {File.exists?("#{gradledir}/gradle-#{node['workstation']['gradle_osx']['version']}/bin/gradle.bat")}
end

execute "uzip_gradle" do
  command "jar xf #{dest_file}"
  cwd gradledir
  creates "#{gradledir}/gradle-#{node['workstation']['gradle_osx']['version']}/bin/gradle.bat"
  action :run
end

directory gradledir do
  mode "0755"
  recursive true
end

execute 'gradle_permissions' do
  command "chmod -R 0755 #{gradledir}/gradle-#{node['workstation']['gradle_osx']['version']}/"
  action :run
end


