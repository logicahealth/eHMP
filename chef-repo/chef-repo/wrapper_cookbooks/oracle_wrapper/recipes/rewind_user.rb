#
# Cookbook Name:: oracle_wrapper
# Recipe:: rewind_user
#


delete_resource(:group, 'oinstall')
delete_resource(:user, 'oracle')
node[:oracle][:user][:sup_grps].each_key { |grp| delete_resource(:group, "group[#{grp}") }

