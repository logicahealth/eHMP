#
# Cookbook Name:: ehmp-balancer_provisioner
# Attributes:: ehmp-balancer
#

default[:'ehmp-ui_provision'][:'ehmp-balancer'][:copy_files] = {}

#######################################################################################################################
# ehmp-balancer specific aws configuration options
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:aws][:instance_type] = "m3.medium"
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:aws][:subnet] = "subnet-213b2256"
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:aws][:ssh_username] = "PW      "
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:aws][:ssh_keyname] = "vagrantaws_c82a142d5205"
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:'ehmp-ui_provision'][:'ehmp-balancer'][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# ehmp-balancer specific vagrant configuration options
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:vagrant][:ip_address] = "172.16.1.149"
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:vagrant][:provider_config] = {}
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:vagrant][:shared_folders] = []
#######################################################################################################################
