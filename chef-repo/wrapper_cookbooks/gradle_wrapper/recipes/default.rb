#
# Cookbook Name:: gradle_wrapper
# Recipe:: default
#


directory File.dirname(node[:gradle][:home])

include_recipe "gradle"
