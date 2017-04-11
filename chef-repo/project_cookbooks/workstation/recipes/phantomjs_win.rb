#
# Cookbook Name:: workstation
# Recipe:: phantomjs_win
#
# Copyright 2016, Medicasoftllc
#
# All rights reserved - Do Not Redistribute

node.default['workstation']['phantomjs_win']['source'] = "https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-#{node['workstation']['phantomjs_win']['version']}-windows.zip"

phantomjsdir = node['workstation']['phantomjs_win']['dir']
file_name = "phantomjs-#{node['workstation']['phantomjs_win']['version']}-windows.zip"
dest_file = File.join(Chef::Config[:file_cache_path], file_name)

directory phantomjsdir do
  mode "0755"
  action :create
end

remote_file dest_file do
  source node['workstation']['phantomjs_win']['source']
  use_conditional_get true
  not_if {File.exists?("#{phantomjsdir}/phantomjs-#{node['workstation']['phantomjs_win']['version']}-windows/phantomjs.exe")}
end

execute "uzip_phantomjs" do
  command "jar -xf \"#{dest_file}\""
  cwd phantomjsdir
  creates "#{phantomjsdir}/phantomjs-#{node['workstation']['phantomjs_win']['version']}-windows/phantomjs.exe"
  action :run
end

directory phantomjsdir do
  mode "0755"
  recursive true
end

env "PHANTOMJS_HOME" do
    value "#{phantomjsdir}/phantomjs-#{node['workstation']['phantomjs_win']['version']}-windows"
    not_if "ENV['PHANTOMJS_HOME'] == #{phantomjsdir}/phantomjs-#{node['workstation']['phantomjs_win']['version']}-windows"
end

env "PATH" do
  delim ";"
  value "%PHANTOMJS_HOME%"
  action :modify
  not_if "ENV['PHANTOMJS_HOME']"
end
