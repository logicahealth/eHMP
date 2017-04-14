#
# Cookbook Name:: astronaut
# Resource:: appointment_create
#
# Create appointments using vista menu options
#
actions :create
default_action :create

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :duz, :kind_of => Integer, :required => false
attribute :time, :kind_of => Integer, :required => true
attribute :day, :kind_of => Integer, :required => true
attribute :patient, :kind_of => String, :required => true
attribute :clinic, :kind_of => String, :required => true
attribute :programmer_mode, :kind_of => [TrueClass, FalseClass], :default => false
attribute :namespace, :kind_of => String, :required => true
attribute :log, :default => ''