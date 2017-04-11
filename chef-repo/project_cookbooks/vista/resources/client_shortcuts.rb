#
# Cookbook Name:: vista
# Resource:: client_shortcuts
#

actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :sites, :kind_of => Array, :required => true
