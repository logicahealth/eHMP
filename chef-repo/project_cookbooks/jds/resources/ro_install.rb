#
# Cookbook Name:: cache
# Resource:: ro_install
#
# Installs a M RO file into a Cache instance
#

actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :source, :kind_of => String, :required => true
attribute :log, :kind_of => IO, :default => ''
attribute :namespace, :kind_of => String, :required => true
attribute :cache_username, :kind_of => String, :required => false
attribute :cache_password, :kind_of => String, :required => false
