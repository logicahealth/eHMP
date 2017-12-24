#
# Cookbook Name:: rdk_provisioner
# Attributes:: pick-list
#

default[:rdk_provision][:pick_list][:copy_files] = {}

#######################################################################################################################
# rdk specific aws configuration options
default[:rdk_provision][:pick_list][:aws][:instance_type] = "m3.medium"
default[:rdk_provision][:pick_list][:aws][:subnet] = "DNS"
default[:rdk_provision][:pick_list][:aws][:ssh_username] = "USER    "
default[:rdk_provision][:pick_list][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:rdk_provision][:pick_list][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:rdk_provision][:pick_list][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# rdk specific vagrant configuration options
default[:rdk_provision][:pick_list][:vagrant][:ip_address] = "IP        "
default[:rdk_provision][:pick_list][:vagrant][:provider_config] = {}
default[:rdk_provision][:pick_list][:vagrant][:shared_folders] = []
#######################################################################################################################
