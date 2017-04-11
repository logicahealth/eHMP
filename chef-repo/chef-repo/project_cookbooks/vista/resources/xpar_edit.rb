#
# Cookbook Name:: vista
# Resource:: xpar_edit
#
# Adds a PARAMETER DEFINITION entry
#
#

actions :do
default_action :do

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :log, :default => ''
attribute :parameter_definition_name, :kind_of => String, :required => true
