#
# Cookbook Name:: cds_provisioner
# Attributes:: cdsdashboard

default[:cds_provision][:cdsdashboard][:copy_files] = {}

#######################################################################################################################
# cdsdashboard specific aws configuration options
default[:cds_provision][:cdsdashboard][:aws][:instance_type] = "m3.medium"
default[:cds_provision][:cdsdashboard][:aws][:subnet] = "DNS"
default[:cds_provision][:cdsdashboard][:aws][:ssh_username] = "USER    "
default[:cds_provision][:cdsdashboard][:aws][:ssh_keyname] = "SSH KEYNAME"
default[:cds_provision][:cdsdashboard][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:cds_provision][:cdsdashboard][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# cdsdashboard specific vagrant configuration options
default[:cds_provision][:cdsdashboard][:vagrant][:ip_address] = "IP       "
default[:cds_provision][:cdsdashboard][:vagrant][:provider_config] = {
  :memory => 1024
}
default[:cds_provision][:cdsdashboard][:vagrant][:shared_folders] = []
#######################################################################################################################
