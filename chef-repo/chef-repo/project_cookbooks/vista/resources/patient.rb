#
# Cookbook Name:: vista
# Resource:: patient
#
# creates patients
#
actions :create
default_action :create

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :sex, :kind_of => String, :required => true
attribute :dob, :kind_of => String, :required => true