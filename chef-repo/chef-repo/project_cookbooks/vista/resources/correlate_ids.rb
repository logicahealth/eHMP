#
# Cookbook Name:: vista
# Resource:: correlate_ids
#
# Performs arbitrary M commands. This is sometimes necesssary for server configuration, but should be treated as a last option.
# If one updates file pointers using this command, the reindex resource should be used immediately afterwards.
#

actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :duz, :kind_of => Integer, :required => false
attribute :json, :kind_of => String, :required => true
attribute :programmer_mode, :kind_of => [TrueClass, FalseClass], :default => true
attribute :namespace, :kind_of => String, :required => true
attribute :log, :default => ''
