#
# Cookbook Name:: cds_provisioner
# Attributes:: cdsdashboard

default[:cds_provision][:cdsdashboard][:copy_files] = {}

#######################################################################################################################
# cdsdashboard specific aws configuration options
default[:cds_provision][:cdsdashboard][:aws][:instance_type] = "m3.medium"
default[:cds_provision][:cdsdashboard][:aws][:subnet] = "subnet-213b2256"
default[:cds_provision][:cdsdashboard][:aws][:ssh_username] = "ec2-user"
default[:cds_provision][:cdsdashboard][:aws][:ssh_keyname] = "vagrantaws_c82a142d5205"
default[:cds_provision][:cdsdashboard][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:cds_provision][:cdsdashboard][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# cdsdashboard specific vagrant configuration options
default[:cds_provision][:cdsdashboard][:vagrant][:ip_address] = "10.2.2.48"
default[:cds_provision][:cdsdashboard][:vagrant][:provider_config] = {
  :memory => 1024
}
default[:cds_provision][:cdsdashboard][:vagrant][:shared_folders] = []
#######################################################################################################################
