#
# Cookbook Name:: ehmp_balancer
# Resource:: import_certs
#

actions :execute
default_action :execute
attribute :name, :kind_of => String, :required => false, :name_attribute => true
attribute :data_bag_item, :kind_of => String, :required => true
attribute :password_file, :kind_of => String, :required => true
