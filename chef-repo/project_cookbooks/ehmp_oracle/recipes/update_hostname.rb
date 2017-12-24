#
# Cookbook Name:: ehmp_oracle
# Recipe:: update_hostname
#

include_recipe "oracle_wrapper::update_hostname"

node.automatic['ipaddress'] = node['vbox_ip']
