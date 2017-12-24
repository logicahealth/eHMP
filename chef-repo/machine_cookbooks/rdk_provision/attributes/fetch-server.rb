#
# Cookbook Name:: rdk_provisioner
# Attributes:: fetch-server
#

default[:rdk_provision][:fetch_server][:copy_files] = {}

#######################################################################################################################
# rdk specific aws configuration options
default[:rdk_provision][:fetch_server][:aws][:instance_type] = "m3.medium"
default[:rdk_provision][:fetch_server][:aws][:subnet] = "DNS"
default[:rdk_provision][:fetch_server][:aws][:ssh_username] = "USER    "
default[:rdk_provision][:fetch_server][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:rdk_provision][:fetch_server][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:rdk_provision][:fetch_server][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# rdk specific vagrant configuration options
default[:rdk_provision][:fetch_server][:vagrant][:ip_address] = "IP        "
default[:rdk_provision][:fetch_server][:vagrant][:provider_config] = {}
default[:rdk_provision][:fetch_server][:vagrant][:shared_folders] = []
#######################################################################################################################
