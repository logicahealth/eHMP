#
# Cookbook Name:: ehmp_provisioner
# Attributes:: jena_fuseki
#

default[:ehmp_provision][:crs][:copy_files] = {}

#######################################################################################################################
# jena_fuseki specific aws configuration options
default[:ehmp_provision][:crs][:aws][:instance_type] = "m3.large"
default[:ehmp_provision][:crs][:aws][:subnet] = "DNS"
default[:ehmp_provision][:crs][:aws][:ssh_username] = "USER    "
default[:ehmp_provision][:crs][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:ehmp_provision][:crs][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:ehmp_provision][:crs][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# jena_fuseki specific vagrant configuration options
default[:ehmp_provision][:crs][:vagrant][:ip_address] = "IP        "
default[:ehmp_provision][:crs][:vagrant][:provider_config] = {
	:memory => 4096
}
default[:ehmp_provision][:crs][:vagrant][:shared_folders] = []
#######################################################################################################################
