#
# Cookbook Name:: vagrant_wrapper
# Recipe:: default
#

include_recipe "aws"

include_recipe "aws_wrapper::set_tags"

include_recipe "aws_wrapper::set_ip"
