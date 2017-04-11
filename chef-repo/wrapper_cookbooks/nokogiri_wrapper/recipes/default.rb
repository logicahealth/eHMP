#
# Cookbook Name:: nokogiri_wrapper
# Recipe:: default
#

yum_package "xz-devel"

include_recipe "nokogiri"
