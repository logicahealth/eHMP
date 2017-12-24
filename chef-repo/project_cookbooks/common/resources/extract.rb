#
# Cookbook Name:: common
# Resources:: extract
#

actions :extract, :extract_if_missing
default_action :extract

attribute :file, :kind_of => String, :name_attribute => true
attribute :owner, :kind_of => String, :default => node['current_user']
attribute :directory, :kind_of => String, :required => true
