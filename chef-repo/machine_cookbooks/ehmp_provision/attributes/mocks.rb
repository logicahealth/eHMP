#
# Cookbook Name:: ehmp_provisioner
# Attributes:: mocks
#

default[:ehmp_provision][:mocks][:copy_files] = {}

#######################################################################################################################
# mocks specific aws configuration options
default[:ehmp_provision][:mocks][:aws][:instance_type] = "m3.medium"
default[:ehmp_provision][:mocks][:aws][:subnet] = "DNS"
default[:ehmp_provision][:mocks][:aws][:ssh_username] = "USER    "
default[:ehmp_provision][:mocks][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:ehmp_provision][:mocks][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:ehmp_provision][:mocks][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# mocks specific vagrant configuration options
default[:ehmp_provision][:mocks][:vagrant][:ip_address] = "IP        "
default[:ehmp_provision][:mocks][:vagrant][:provider_config] = {
  :memory => 1024
}
default[:ehmp_provision][:mocks][:vagrant][:shared_folders] = []
#######################################################################################################################
