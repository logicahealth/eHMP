#
# Cookbook Name:: ehmp_oracle
# Resource:: ehmp_routing_users
#
# Gets users from PJDS and filters them
#
actions :execute
default_action :execute
attribute :name, :kind_of => String, :required => false, :name_attribute => true
