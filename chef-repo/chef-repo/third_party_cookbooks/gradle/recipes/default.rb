#
# Cookbook Name:: gradle
# Recipe:: default
#
# Author:: Olle Hallin (<olle.hallin@crisp.se>)
#

include_recipe "java"
include_recipe "ark"

ark "gradle" do
  url node[:gradle][:url]
  checksum node[:gradle][:checksum]
  home_dir node[:gradle][:home]
  version node[:gradle][:version]
  append_env_path true
  action :install
end

template "/etc/profile.d/gradle_home.sh" do
  mode 0755
  source "gradle_home.sh.erb"
  variables(:gradle_home => node[:gradle][:home])
end

