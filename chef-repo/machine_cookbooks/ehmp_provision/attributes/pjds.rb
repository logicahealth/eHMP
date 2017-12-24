#
# Cookbook Name:: ehmp_provisioner
# Attributes:: pjds
#

default[:ehmp_provision][:pjds][:copy_files] = {}

#######################################################################################################################
# pjds specific aws configuration options
default[:ehmp_provision][:pjds][:aws][:instance_type] = "m3.medium"
default[:ehmp_provision][:pjds][:aws][:subnet] = "DNS"
default[:ehmp_provision][:pjds][:aws][:ssh_username] = "USER    "
default[:ehmp_provision][:pjds][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:ehmp_provision][:pjds][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:ehmp_provision][:pjds][:aws][:ssh_keyname]}"
#######################################################################################################################
