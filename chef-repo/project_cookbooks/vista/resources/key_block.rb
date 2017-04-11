#
# Cookbook Name:: vista
# Resource:: key_block
#
# Performs arbitrary M commands. This is used for encryption key configuration
#
# This resource was copied from mumps_block and modified to make command and namespace parameters optional
#

actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :duz, :kind_of => Integer, :required => false
attribute :command, :kind_of => Array, :required => false
attribute :programmer_mode, :kind_of => [TrueClass, FalseClass], :default => false
attribute :namespace, :kind_of => String, :required => false
attribute :log, :default => ''
