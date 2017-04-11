#
# Cookbook Name:: jds
# Resource:: post_data
#

actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :stores, :kind_of => Array, :required => true
attribute :data_dir, :kind_of => String, :required => true
