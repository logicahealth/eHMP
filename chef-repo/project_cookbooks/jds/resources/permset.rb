#
# Cookbook Name:: jds
# Resource:: permset
#

actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :store_name, :kind_of => String, :required => false, :default => nil
attribute :data_path, :kind_of => String, :required => false, :default => nil

