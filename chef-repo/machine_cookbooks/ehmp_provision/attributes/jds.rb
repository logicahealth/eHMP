#
# Cookbook Name:: ehmp_provisioner
# Attributes:: jds
#

default[:ehmp_provision][:jds][:copy_files] = {}

#######################################################################################################################
# jds specific aws configuration options
default[:ehmp_provision][:jds][:aws][:instance_type] = "m3.large"
default[:ehmp_provision][:jds][:aws][:subnet] = "subnet-213b2256"
default[:ehmp_provision][:jds][:aws][:ssh_username] = "PW      "
default[:ehmp_provision][:jds][:aws][:ssh_keyname] = "redacted"
default[:ehmp_provision][:jds][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:ehmp_provision][:jds][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# jds specific vagrant configuration options
default[:ehmp_provision][:jds][:vagrant][:ip_address] = "IP_ADDRESS"
default[:ehmp_provision][:jds][:vagrant][:provider_config] = {
  :memory => 1024
}
default[:ehmp_provision][:jds][:vagrant][:shared_folders] = []
#######################################################################################################################
