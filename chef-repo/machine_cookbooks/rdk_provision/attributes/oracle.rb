#
# Cookbook Name:: rdk_provisioner
# Attributes:: oracle
#

default[:rdk_provision][:oracle][:copy_files] = {}

#######################################################################################################################
# jbpm specific aws configuration options
default[:rdk_provision][:oracle][:aws][:instance_type] = "m3.large"
default[:rdk_provision][:oracle][:aws][:subnet] = "DNS"
default[:rdk_provision][:oracle][:aws][:ssh_username] = "USER    "
default[:rdk_provision][:oracle][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:rdk_provision][:oracle][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:rdk_provision][:oracle][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# jbpm specific vagrant configuration options
default[:rdk_provision][:oracle][:vagrant][:ip_address] = "IP        "
default[:rdk_provision][:oracle][:vagrant][:provider_config] = {
  :memory => 1536,
  :cpus => 4
}
default[:rdk_provision][:oracle][:vagrant][:shared_folders] = []
#######################################################################################################################
