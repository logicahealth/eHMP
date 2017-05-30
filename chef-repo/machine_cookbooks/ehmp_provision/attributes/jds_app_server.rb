#
# Cookbook Name:: ehmp_provisioner
# Attributes:: jds_app_server
#

default[:ehmp_provision][:jds_app_server][:copy_files] = {}

#######################################################################################################################
# jds specific aws configuration options
default[:ehmp_provision][:jds_app_server][:aws][:instance_type] = "m3.medium"
default[:ehmp_provision][:jds_app_server][:aws][:subnet] = "subnet-213b2256"
default[:ehmp_provision][:jds_app_server][:aws][:ssh_username] = "REDACTED"
default[:ehmp_provision][:jds_app_server][:aws][:ssh_keyname] = "REDACTED"
default[:ehmp_provision][:jds_app_server][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:ehmp_provision][:jds_app_server][:aws][:ssh_keyname]}"
#######################################################################################################################
