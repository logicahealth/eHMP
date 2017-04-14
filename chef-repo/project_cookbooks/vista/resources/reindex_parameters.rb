#
# Cookbook Name:: astronaut
# Resource:: reindex_parameters
#
# Create appointments using vista menu options
#
actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :duz, :kind_of => Integer, :required => false
attribute :programmer_mode, :kind_of => [TrueClass, FalseClass], :default => false
attribute :namespace, :kind_of => String, :required => true
attribute :log, :default => ''