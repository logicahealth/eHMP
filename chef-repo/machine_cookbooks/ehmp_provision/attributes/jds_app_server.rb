#
# Cookbook Name:: ehmp_provisioner
# Attributes:: jds_app_server
#

default[:ehmp_provision][:jds_app_server][:copy_files] = {}

#######################################################################################################################
# jds specific aws configuration options
default[:ehmp_provision][:jds_app_server][:aws][:instance_type] = "m4.large"
default[:ehmp_provision][:jds_app_server][:aws][:subnet] = "DNS"
default[:ehmp_provision][:jds_app_server][:aws][:ssh_username] = "USER    "
default[:ehmp_provision][:jds_app_server][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:ehmp_provision][:jds_app_server][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:ehmp_provision][:jds_app_server][:aws][:ssh_keyname]}"
#######################################################################################################################
