#
# Cookbook Name:: ehmp_provisioner
# Attributes:: vxsync
#

default[:ehmp_provision][:vxsync][:copy_files] = {}

#######################################################################################################################
# vxsync specific aws configuration options
default[:ehmp_provision][:vxsync][:aws][:instance_type] = ENV["VXSYNC_INSTANCE_TYPE"] || "m3.xlarge"
default[:ehmp_provision][:vxsync][:aws][:subnet] = "subnet-213b2256"
default[:ehmp_provision][:vxsync][:aws][:ssh_username] = "PW      "
default[:ehmp_provision][:vxsync][:aws][:ssh_keyname] = "vagrantaws_c82a142d5205"
default[:ehmp_provision][:vxsync][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:ehmp_provision][:vxsync][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# vxsync specific vagrant configuration options
default[:ehmp_provision][:vxsync][:vagrant][:ip_address] = "172.16.3.6"
default[:ehmp_provision][:vxsync][:vagrant][:provider_config] = {
  :memory => 3072,
  :cpus => 4
}
default[:ehmp_provision][:vxsync][:vagrant][:shared_folders] = []
#######################################################################################################################
