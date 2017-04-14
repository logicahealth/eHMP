#
# Cookbook Name:: jds
# Resource:: security_block
#
# Imports security xml profiles.
#
#

actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :duz, :kind_of => Integer, :required => false
attribute :log, :kind_of => IO, :default => ''
attribute :cache_username, :kind_of => String, :required => false
attribute :cache_password, :kind_of => String, :required => false
attribute :xml_path, :kind_of => String, :required =>true
