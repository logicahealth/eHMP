#
# Cookbook Name:: workstation
# Recipe:: python_win
#
# Copyright 2016, Medicasoftllc
#
# All rights reserved - Do Not Redistribute

node.default['workstation']['groovy_win']['source'] = "#{node[:nexus_url]}/nexus/service/local/repositories/ehmp-win/content/filerepo/third-party/program/groovy/groovy/#{node['workstation']['groovy_win']['version']}/groovy-#{node['workstation']['groovy_win']['version']}.zip"

groovydir = node['workstation']['groovy_win']['dir']
file_name = "groovy-#{node['workstation']['groovy_win']['version']}.zip"
dest_file = File.join(Chef::Config[:file_cache_path], file_name)

directory groovydir do
  mode "0755"
  action :create
end

remote_file dest_file do
  source node['workstation']['groovy_win']['source']
  use_conditional_get true
  not_if {File.exists?("#{groovydir}/groovy-#{node['workstation']['groovy_win']['version']}/bin/groovy")}
end

execute "uzip_groovy" do
  command "jar -xf \"#{dest_file}\""
  cwd groovydir
  creates "#{groovydir}/groovy-#{node['workstation']['groovy_win']['version']}/bin/groovy"
  action :run
end

directory groovydir do
  mode "0755"
  recursive true
end

env "GROOVY_HOME" do
    value "#{groovydir}/groovy-#{node['workstation']['groovy_win']['version']}"
    not_if "ENV['GROOVY_HOME'] == #{groovydir}/groovy-#{node['workstation']['groovy_win']['version']}"
end

env "PATH" do
  delim ";"
  value "%GROOVY_HOME%"
  action :modify
  not_if "ENV['GROOVY_HOME']"
end
