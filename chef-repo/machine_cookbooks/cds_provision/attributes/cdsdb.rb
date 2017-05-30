#
# Cookbook Name:: cds_provisioner
# Attributes:: cdsdb
#


default[:cds_provision][:cdsdb][:copy_files] = {}

#######################################################################################################################
# cdsdb specific aws configuration options
default[:cds_provision][:cdsdb][:aws][:instance_type] = "m3.medium"
default[:cds_provision][:cdsdb][:aws][:subnet] = "subnet-213b2256"
default[:cds_provision][:cdsdb][:aws][:ssh_username] = "REDACTED"
default[:cds_provision][:cdsdb][:aws][:ssh_keyname] = "REDACTED"
default[:cds_provision][:cdsdb][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:cds_provision][:cdsdb][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# cdsdb specific vagrant configuration options
default[:cds_provision][:cdsdb][:vagrant][:ip_address] = "IP        "
default[:cds_provision][:cdsdb][:vagrant][:provider_config] = {
  :memory => 1024
}
default[:cds_provision][:cdsdb][:vagrant][:copy_files] = {}
default[:cds_provision][:cdsdb][:vagrant][:shared_folders] = []
#######################################################################################################################
