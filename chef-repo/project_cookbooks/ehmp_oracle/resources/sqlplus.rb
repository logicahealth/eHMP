#
# Cookbook:: ehmp_oracle
# Resource:: sqlplus
#
actions :execute
default_action :execute
attribute :name, :kind_of => String, :required => false, :name_attribute => true
attribute :log_file, :kind_of => String, :required => true, :default => node['ehmp_oracle']['oracle_config']['log_file']
attribute :install_file, :kind_of => String, :required => true
attribute :connect_string, :kind_of => String, :required => true