#
# Cookbook Name:: vista
# Resource:: global_import_utility
#
# This resource provides access to the ^%GI utility
#

actions :create
default_action :create

attribute :duz, :kind_of => Integer, :required => false
attribute :programmer_mode, :kind_of => [TrueClass, FalseClass], :default => false
attribute :log, :default => STDOUT
attribute :import_file, :kind_of => String, :required => true
attribute :dik_da_pairs, :kind_of => Array, :default => []