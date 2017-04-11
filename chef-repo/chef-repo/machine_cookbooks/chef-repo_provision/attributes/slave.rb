#
# Cookbook Name:: chef-repo_provision
# Attributes:: slave
#

#######################################################################################################################
# slave specific aws configuration options
default[:'chef-repo_provision'][:slave][:jenkins_url] = "https://ci.vistacore.us"
default[:'chef-repo_provision'][:slave][:aws][:instance_type] = "m3.xlarge"
default[:'chef-repo_provision'][:slave][:aws][:subnet] = "subnet-213b2256"
default[:'chef-repo_provision'][:slave][:aws][:ssh_username] = "ec2-user"
default[:'chef-repo_provision'][:slave][:aws][:ssh_keyname] = "vagrantaws_c82a142d5205"
default[:'chef-repo_provision'][:slave][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:'chef-repo_provision'][:slave][:aws][:ssh_keyname]}"
#######################################################################################################################
