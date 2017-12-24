#
# Cookbook Name:: ehmp-balancer_provisioner
# Attributes:: ehmp-balancer
#

default[:'ehmp-ui_provision'][:'ehmp-balancer'][:copy_files] = {}

#######################################################################################################################
# ehmp-balancer specific aws configuration options
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:aws][:instance_type] = "m3.medium"
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:aws][:subnet] = "DNS"
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:aws][:ssh_username] = "USER    "
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:'ehmp-ui_provision'][:'ehmp-balancer'][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# ehmp-balancer specific vagrant configuration options
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:vagrant][:ip_address] = "IP        "
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:vagrant][:provider_config] = {}
default[:'ehmp-ui_provision'][:'ehmp-balancer'][:vagrant][:shared_folders] = []
#######################################################################################################################
