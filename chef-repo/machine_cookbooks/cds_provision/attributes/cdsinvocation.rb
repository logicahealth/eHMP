#
# Cookbook Name:: cds_provisioner
# Attributes:: cdsinvocation

default[:cds_provision][:cdsinvocation][:copy_files] = {}

#######################################################################################################################
# cdsinvocation specific aws configuration options
default[:cds_provision][:cdsinvocation][:aws][:instance_type] = "m3.medium"
default[:cds_provision][:cdsinvocation][:aws][:subnet] = "subnet-213b2256"
default[:cds_provision][:cdsinvocation][:aws][:ssh_username] = "ec2-user"
default[:cds_provision][:cdsinvocation][:aws][:ssh_keyname] = "vagrantaws_c82a142d5205"
default[:cds_provision][:cdsinvocation][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:cds_provision][:cdsinvocation][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# cdsinvocation specific vagrant configuration options
default[:cds_provision][:cdsinvocation][:vagrant][:ip_address] = "IPADDRESS"
default[:cds_provision][:cdsinvocation][:vagrant][:provider_config] = {
  :memory => 1024,
  :cpus => 2
}
default[:cds_provision][:cdsinvocation][:vagrant][:shared_folders] = []
#######################################################################################################################
