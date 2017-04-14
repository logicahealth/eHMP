#
# Cookbook Name:: jds
# Resource:: key_block
#
# Imports encryption keys.
#

actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :duz, :kind_of => Integer, :required => false
attribute :log, :kind_of => IO, :default => ''
attribute :cache_username, :kind_of => String, :required => false
attribute :cache_password, :kind_of => String, :required => false
