#
# Cookbook Name:: jds
# Resource:: permission
#

actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :store, :kind_of => String
attribute :port, :kind_of => [String, Integer], :required => true
attribute :delete_store, kind_of: [TrueClass, FalseClass], default: false
attribute :data_dir, :kind_of => String, :required => true
