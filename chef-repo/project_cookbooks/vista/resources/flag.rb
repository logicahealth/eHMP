#
# Cookbook Name:: astronaut
# Resource:: flag
#
# Create a flag for a patient
#
actions :create
default_action :create

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :duz, :kind_of => Integer, :required => false
attribute :patient, :kind_of => String, :required => true
attribute :programmer_mode, :kind_of => [TrueClass, FalseClass], :default => false
attribute :namespace, :kind_of => String, :required => true
attribute :log, :default => ''