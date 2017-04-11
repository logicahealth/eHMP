#
# Cookbook Name:: java_wrapper
# Recipe:: default
#

include_recipe "java_wrapper::remove_older_jdks"
include_recipe "java"
