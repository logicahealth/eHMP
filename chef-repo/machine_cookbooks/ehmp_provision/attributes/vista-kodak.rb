#
# Cookbook Name:: ehmp_provisioner
# Attributes:: vista-kodak
#

default[:ehmp_provision][:'vista-kodak'][:copy_files] = {}

#######################################################################################################################
# vista-kodak specific aws configuration options
default[:ehmp_provision][:'vista-kodak'][:aws][:instance_type] = "m3.medium"
default[:ehmp_provision][:'vista-kodak'][:aws][:subnet] = "DNS"
default[:ehmp_provision][:'vista-kodak'][:aws][:ssh_username] = "USER    "
default[:ehmp_provision][:'vista-kodak'][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:ehmp_provision][:'vista-kodak'][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:ehmp_provision][:'vista-kodak'][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# vista-kodak specific vagrant configuration options
default[:ehmp_provision][:'vista-kodak'][:vagrant][:ip_address] = "IP        "
default[:ehmp_provision][:'vista-kodak'][:vagrant][:provider_config] = {}
default[:ehmp_provision][:'vista-kodak'][:vagrant][:shared_folders] = []
#######################################################################################################################

default[:ehmp_provision][:'vista-kodak'][:aws][:copy_files] = {}
