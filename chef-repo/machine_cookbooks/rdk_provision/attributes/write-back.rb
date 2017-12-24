#
# Cookbook Name:: rdk_provisioner
# Attributes:: write-back
#

default[:rdk_provision][:write_back][:copy_files] = {}

#######################################################################################################################
# rdk specific aws configuration options
default[:rdk_provision][:write_back][:aws][:instance_type] = "m3.medium"
default[:rdk_provision][:write_back][:aws][:subnet] = "DNS"
default[:rdk_provision][:write_back][:aws][:ssh_username] = "USER    "
default[:rdk_provision][:write_back][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:rdk_provision][:write_back][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:rdk_provision][:write_back][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# rdk specific vagrant configuration options
default[:rdk_provision][:write_back][:vagrant][:ip_address] = "IP        "
default[:rdk_provision][:write_back][:vagrant][:provider_config] = {}
default[:rdk_provision][:write_back][:vagrant][:shared_folders] = []
#######################################################################################################################
