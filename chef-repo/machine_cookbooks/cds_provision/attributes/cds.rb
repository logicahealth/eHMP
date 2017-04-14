#
# Cookbook Name:: cds_provisioner
# Attributes:: cds
#

default[:cds_provision][:cds][:copy_files] = {}

#######################################################################################################################
# cds specific aws configuration options
default[:cds_provision][:cds][:aws][:instance_type] = "m3.medium"
default[:cds_provision][:cds][:aws][:subnet] = "subnet-213b2256"
default[:cds_provision][:cds][:aws][:ssh_username] = "ec2-user"
default[:cds_provision][:cds][:aws][:ssh_keyname] = "vagrantaws_c82a142d5205"
default[:cds_provision][:cds][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:cds_provision][:cds][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# cds specific vagrant configuration options
default[:cds_provision][:cds][:vagrant][:ip_address] = "10.2.2.50"
default[:cds_provision][:cds][:vagrant][:provider_config] = {
  :memory => 1024,
  :cpus => 2
}
default[:cds_provision][:cds][:vagrant][:shared_folders] = []
#######################################################################################################################
