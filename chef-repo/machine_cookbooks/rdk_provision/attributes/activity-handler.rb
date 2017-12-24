#
# Cookbook Name:: rdk_provisioner
# Attributes:: activity-handler
#

default[:rdk_provision][:activity_handler][:copy_files] = {}

#######################################################################################################################
# rdk specific aws configuration options
default[:rdk_provision][:activity_handler][:aws][:instance_type] = "m3.medium"
default[:rdk_provision][:activity_handler][:aws][:subnet] = "DNS"
default[:rdk_provision][:activity_handler][:aws][:ssh_username] = "USER    "
default[:rdk_provision][:activity_handler][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:rdk_provision][:activity_handler][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:rdk_provision][:activity_handler][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# rdk specific vagrant configuration options
default[:rdk_provision][:activity_handler][:vagrant][:ip_address] = "IP        "
default[:rdk_provision][:activity_handler][:vagrant][:provider_config] = {}
default[:rdk_provision][:activity_handler][:vagrant][:shared_folders] = []
#######################################################################################################################
