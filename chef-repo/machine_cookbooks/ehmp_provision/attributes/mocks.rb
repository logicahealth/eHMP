#
# Cookbook Name:: ehmp_provisioner
# Attributes:: mocks
#

default[:ehmp_provision][:mocks][:copy_files] = {}

#######################################################################################################################
# mocks specific aws configuration options
default[:ehmp_provision][:mocks][:aws][:instance_type] = ENV["MOCKS_INSTANCE_TYPE"] || "m3.medium"
default[:ehmp_provision][:mocks][:aws][:subnet] = "subnet-213b2256"
default[:ehmp_provision][:mocks][:aws][:ssh_username] = "PW      "
default[:ehmp_provision][:mocks][:aws][:ssh_keyname] = "vagrantaws_c82a142d5205"
default[:ehmp_provision][:mocks][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:ehmp_provision][:mocks][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# mocks specific vagrant configuration options
default[:ehmp_provision][:mocks][:vagrant][:ip_address] = "172.16.4.205"
default[:ehmp_provision][:mocks][:vagrant][:provider_config] = {
  :memory => 1024
}
default[:ehmp_provision][:mocks][:vagrant][:shared_folders] = []
#######################################################################################################################
