#
# Cookbook Name:: astronaut
# Resource:: mumps_block
#
# Performs arbitrary M commands. This is sometimes necesssary for server configuration, but should be treated as a last option.
#

actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :command, :kind_of => Array, :required => true
attribute :namespace, :kind_of => String, :required => true
attribute :log, :kind_of => IO, :default => nil
attribute :cache_username, :kind_of => String, :required => false
attribute :cache_password, :kind_of => String, :required => false
attribute :timeout, :kind_of => Integer, :default => node[:jds][:shell_timeout_seconds]
