#
# Cookbook Name:: cds_provision
# Attributes:: opencds

default[:cds_provision][:opencds][:copy_files] = {}

#######################################################################################################################
# opencds specific aws configuration options
default[:cds_provision][:opencds][:aws][:instance_type] = "m3.medium"
default[:cds_provision][:opencds][:aws][:subnet] = "DNS"
default[:cds_provision][:opencds][:aws][:ssh_username] = "USER    "
default[:cds_provision][:opencds][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:cds_provision][:opencds][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:cds_provision][:opencds][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# opencds specific vagrant configuration options
default[:cds_provision][:opencds][:vagrant][:ip_address] = "IP       "
default[:cds_provision][:opencds][:vagrant][:provider_config] = {
  :memory => 1024
}
default[:cds_provision][:opencds][:vagrant][:shared_folders] = []
#######################################################################################################################
