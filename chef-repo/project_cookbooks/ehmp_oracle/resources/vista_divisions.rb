#
# Cookbook Name:: ehmp_oracle
# Resource:: vista_divisions
#
# Writes vista divions to csv
#
actions :execute
default_action :execute
attribute :name, :kind_of => String, :required => false, :name_attribute => true
