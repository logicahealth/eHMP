#
# Cookbook Name:: ehmp_provisioner
# Attributes:: jds
#

default[:ehmp_provision][:jds][:copy_files] = {}

#######################################################################################################################
# jds specific aws configuration options
default[:ehmp_provision][:jds][:aws][:instance_type] = "m4.large"
default[:ehmp_provision][:jds][:aws][:subnet] = "DNS"
default[:ehmp_provision][:jds][:aws][:ssh_username] = "USER    "
default[:ehmp_provision][:jds][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:ehmp_provision][:jds][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:ehmp_provision][:jds][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# jds specific vagrant configuration options
default[:ehmp_provision][:jds][:vagrant][:ip_address] = "IP        "
default[:ehmp_provision][:jds][:vagrant][:provider_config] = {
  :memory => 1024
}
default[:ehmp_provision][:jds][:vagrant][:shared_folders] = []
#######################################################################################################################
