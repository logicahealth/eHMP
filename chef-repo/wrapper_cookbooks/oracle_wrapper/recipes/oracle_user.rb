#
# Cookbook Name:: oracle_wrapper
# Recipe:: oracle_user
#

group 'create oinstall group' do
  group_name "oinstall"
end

user 'create oracle user' do
  username 'oracle'
  group 'oinstall'
  shell node[:oracle][:user][:shell]
  comment 'Oracle Administrator'
  supports :manage_home => true
end

node[:oracle][:user][:sup_grps].each_key do |grp|
  group "update group #{grp}" do
    group_name grp
    members 'oracle'
    append true
  end
end
