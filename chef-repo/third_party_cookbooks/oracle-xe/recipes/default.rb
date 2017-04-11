#
# Cookbook Name:: oracle-xe
# Recipe:: default
# Author::     an         (<jdunn@opscode.com>)
#
# Copyright (C) 2013 Opscode, Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

remote_file File.join(Chef::Config[:file_cache_path], 'oracle-xe-11.2.0-1.0.x86_64.rpm') do
  source node['oracle-xe']['url']
  action :create
end

# Pre-req for Oracle %preinstall scriptlet
package "bc"

yum_package 'oracle-xe' do
  source File.join(Chef::Config[:file_cache_path], 'oracle-xe-11.2.0-1.0.x86_64.rpm')
  action :install
end

rspfile = File.join(Chef::Config[:file_cache_path], 'xe.rsp')

template rspfile do
  source 'xe.rsp.erb'
  action :create
end

execute "autoconfigure-xe" do
  command "/etc/init.d/oracle-xe configure responseFile=#{rspfile}"
  creates "/u01/app/oracle/oradata"
  returns [0,1] # don't care if it's already configured
end

link "/etc/profile.d/oracle_env.sh" do
  to "/u01/app/oracle/product/11.2.0/xe/bin/oracle_env.sh"
  action :create
end

link "/etc/profile.d/oracle_env.csh" do
  to "/u01/app/oracle/product/11.2.0/xe/bin/oracle_env.csh"
  action :create
end

reset_sql = File.join(Chef::Config[:file_cache_path], 'unlock-system-accounts.sql')

# Silly workaround to Oracle's broken software... unattended mode won't set
# SYS and SYSTEM passwords properly
template reset_sql do
  action :create
  notifies :run, 'execute[unlock-oracle-system-accounts]', :immediately
end

execute "unlock-oracle-system-accounts" do
  command "source /u01/app/oracle/product/11.2.0/xe/bin/oracle_env.sh && sqlplus / as sysdba @#{reset_sql}"
  user 'oracle'
  group 'dba' # required
  action :nothing
end
