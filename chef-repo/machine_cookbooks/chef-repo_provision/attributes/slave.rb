#
# Cookbook Name:: chef-repo_provision
# Attributes:: jds
#

#######################################################################################################################
# jds specific aws configuration options
default[:'chef-repo_provision'][:slave][:aws][:instance_type] = ENV["SLAVE_INSTANCE_TYPE"] || "m3.xlarge"
default[:ehmp_provision][:jds][:aws][:subnet] = "subnet-213b2256"
default[:'chef-repo_provision'][:slave][:aws][:ssh_username] = "PW      "
default[:'chef-repo_provision'][:slave][:aws][:ssh_keyname] = "vagrantaws_c82a142d5205"
default[:'chef-repo_provision'][:slave][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:ehmp_provision][:jds][:aws][:ssh_keyname]}"
#######################################################################################################################
