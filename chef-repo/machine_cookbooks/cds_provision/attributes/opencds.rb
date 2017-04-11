#
# Cookbook Name:: cds_provision
# Attributes:: opencds

default[:cds_provision][:opencds][:copy_files] = {}

#######################################################################################################################
# opencds specific aws configuration options
default[:cds_provision][:opencds][:aws][:instance_type] = ENV["OPENCDS_INSTANCE_TYPE"] || "m3.medium"
default[:cds_provision][:opencds][:aws][:subnet] = "subnet-213b2256"
default[:cds_provision][:opencds][:aws][:ssh_username] = "PW      "
default[:cds_provision][:opencds][:aws][:ssh_keyname] = "vagrantaws_c82a142d5205"
default[:cds_provision][:opencds][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:cds_provision][:opencds][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# opencds specific vagrant configuration options 
default[:cds_provision][:opencds][:vagrant][:ip_address] = "172.16.2.47"
default[:cds_provision][:opencds][:vagrant][:provider_config] = {
  :memory => 1024
}
default[:cds_provision][:opencds][:vagrant][:shared_folders] = []
#######################################################################################################################
