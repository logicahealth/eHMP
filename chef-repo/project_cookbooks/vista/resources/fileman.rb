#
# Cookbook Name:: vista
# Resource:: fileman
#
# This resource provides fileman write access
#

actions :create, :update
default_action :create

attribute :log, :default => ''
attribute :file, :kind_of => String, :required => true
attribute :field_values, :kind_of => Hash, :required => true
