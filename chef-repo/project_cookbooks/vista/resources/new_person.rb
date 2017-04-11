#
# Cookbook Name:: vista
# Resource:: new_person
#
# NOTE: This resource is NOT idempotent due to VistA security requirements for access/verify code resets
#

actions :create, :update
default_action :create

attribute :log, :default => STDOUT
attribute :access_code, :kind_of => String
attribute :verify_code, :kind_of => String # required for :create; not allowed for :update
attribute :full_name, :kind_of => String, :required => true
attribute :ssn, :kind_of => String
attribute :initial, :kind_of => String
attribute :primary_menu_option, :kind_of => String
attribute :secondary_menu_options, :kind_of => Array, :default => []
attribute :keys, :kind_of => Array, :default => []
attribute :cprs_tab, :kind_of => String
attribute :signature, :kind_of => String
attribute :signature_block_title, :kind_of => String
attribute :authorized_for_med_orders, :kind_of => [TrueClass, FalseClass]
attribute :service_section, :kind_of => String
