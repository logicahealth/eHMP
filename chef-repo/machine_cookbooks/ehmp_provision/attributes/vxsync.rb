#
# Cookbook Name:: ehmp_provisioner
# Attributes:: vxsync
#

default[:ehmp_provision][:vxsync][:copy_files] = {}
default[:ehmp_provision][:vxsync][:vxsync_applications] = ["client", "vista"]

#######################################################################################################################
# vxsync specific aws configuration options
default[:ehmp_provision][:vxsync][:aws][:instance_type] ="m3.xlarge"
default[:ehmp_provision][:vxsync][:aws][:subnet] = "DNS"
default[:ehmp_provision][:vxsync][:aws][:ssh_username] = "USER    "
default[:ehmp_provision][:vxsync][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:ehmp_provision][:vxsync][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:ehmp_provision][:vxsync][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# vxsync specific vagrant configuration options
default[:ehmp_provision][:vxsync][:vagrant][:ip_address] = "IP      "
default[:ehmp_provision][:vxsync][:vagrant][:provider_config] = {
  :memory => 3584,
  :cpus => 4
}
default[:ehmp_provision][:vxsync][:vagrant][:shared_folders] = []
#######################################################################################################################
