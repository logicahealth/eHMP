#
# Cookbook:: ehmp_oracle
# Resource:: oracle_patch
#
actions :execute
default_action :execute
attribute :log_file, :kind_of => String, :required => true, :default => node['ehmp_oracle']['oracle_config']['log_file']
attribute :patch_path, :kind_of => String, :required => true
attribute :patch_number, :kind_of => String, :required => true
attribute :patch_type, :kind_of => String, :required => true