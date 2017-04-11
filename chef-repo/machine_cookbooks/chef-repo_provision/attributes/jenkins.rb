#
# Cookbook Name:: ehmp_provisioner
# Attributes:: vista-kodak
#

default[:'chef-repo_provision'][:jenkins][:copy_files] = {}

#######################################################################################################################
# vista-kodak specific aws configuration options
default[:'chef-repo_provision'][:jenkins][:aws][:instance_type] = ENV["JENKINS_INSTANCE_TYPE"] || "m3.medium"
default[:'chef-repo_provision'][:jenkins][:aws][:subnet] = "subnet-213b2256"
default[:'chef-repo_provision'][:jenkins][:aws][:ssh_username] = "PW      "
default[:'chef-repo_provision'][:jenkins][:aws][:ssh_keyname] = "redacted"
default[:'chef-repo_provision'][:jenkins][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:'chef-repo_provision'][:jenkins][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# vista-kodak specific vagrant configuration options
default[:'chef-repo_provision'][:jenkins][:vagrant][:ip_address] = "IP_ADDRESS"
default[:'chef-repo_provision'][:jenkins][:vagrant][:provider_config] = {}
default[:'chef-repo_provision'][:jenkins][:vagrant][:shared_folders] = []
#######################################################################################################################

default[:'chef-repo_provision'][:jenkins][:aws][:copy_files] = {}
