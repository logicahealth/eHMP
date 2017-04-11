#
# Cookbook Name:: common
# Resources:: directory
#

actions :create, :delete
default_action :create

attribute :path, :kind_of => String, :name_attribute => true
attribute :group, :kind_of => [String, Integer]
attribute :inherits, :kind_of => [TrueClass, FalseClass]
attribute :mode, :kind_of => [String, Integer]
attribute :owner, :kind_of => [String, Integer]
attribute :recursive, :kind_of => [TrueClass, FalseClass]
attribute :rights, :kind_of => Hash
attribute :action, :kind_of => Symbol