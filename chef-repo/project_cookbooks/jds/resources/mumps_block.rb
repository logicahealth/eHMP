#
# Cookbook Name:: astronaut
# Resource:: mumps_block
#
# Performs arbitrary M commands. This is sometimes necesssary for server configuration, but should be treated as a last option.
# If one updates file pointers using this command, the reindex resource should be used immediately afterwards.
#

actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :duz, :kind_of => Integer, :required => false
attribute :command, :kind_of => Array, :required => true
attribute :programmer_mode, :kind_of => [TrueClass, FalseClass], :default => false
attribute :namespace, :kind_of => String, :required => true
attribute :log, :kind_of => IO, :default => ''
