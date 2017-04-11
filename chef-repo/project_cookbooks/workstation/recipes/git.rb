#
# Cookbook Name:: workstation
# Recipe:: git

include_recipe "git_wrapper"

execute "git config --global push.default simple"
