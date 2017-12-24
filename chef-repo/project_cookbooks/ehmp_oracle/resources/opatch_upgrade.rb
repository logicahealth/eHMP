#
# Cookbook:: ehmp_oracle
# Resource:: oracle_patch
#
actions :execute
default_action :execute
attribute :log_file, :kind_of => String, :required => true, :default => node['ehmp_oracle']['oracle_config']['log_file']
attribute :opatch_source, :kind_of => String, :required => true
