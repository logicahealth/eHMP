#
# Cookbook Name:: oracle_wrapper
# Recipe:: rewind_user
#

chef_gem "chef-rewind" do
  version node[:oracle_wrapper][:rewind_user][:'chef-rewind_version']
end

require 'chef/rewind'

unwind 'group[oinstall]'
unwind 'user[oracle]'
node[:oracle][:user][:sup_grps].each_key { |grp| unwind "group[#{grp}]" }
