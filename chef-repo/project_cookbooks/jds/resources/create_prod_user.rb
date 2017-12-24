#
# Cookbook Name:: jds
# Resource:: create_prod_user
#

actions :create
default_action :create

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :store_url, :kind_of => String
attribute :data_bag_info, :required => true
