#
# Cookbook Name:: jds
# Resource:: populate_data_store
#

actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :store, :kind_of => String
attribute :port, :kind_of => [String, Integer], :required => true
attribute :populate_params, kind_of: Hash, :required => false
