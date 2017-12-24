#
# Cookbook Name:: jds
# Resource:: create_data_store
#

actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :store, :kind_of => String
attribute :port, :kind_of => [String, Integer], :required => true
attribute :clear_store, kind_of: [TrueClass, FalseClass], :default => false
attribute :index, kind_of: Hash, :required => false
attribute :template, kind_of: Hash, :required => false
