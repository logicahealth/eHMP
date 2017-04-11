#
# Cookbook Name:: ehmp-ui_provisioner
# Attributes:: ehmp-ui
#

# ehmp-ui specific configuration that is "driver" independent
default[:'ehmp-ui_provision'][:'ehmp-ui'][:adk_home] = "/var/www/ehmp-ui"
default[:'ehmp-ui_provision'][:'ehmp-ui'][:ui_home] = "/var/www/ehmp-ui/app"
default[:'ehmp-ui_provision'][:'ehmp-ui'][:copy_files] = {}

#######################################################################################################################
# ehmp-ui specific aws configuration options
default[:'ehmp-ui_provision'][:'ehmp-ui'][:aws][:instance_type] = "m3.medium"
default[:'ehmp-ui_provision'][:'ehmp-ui'][:aws][:subnet] = "subnet-213b2256"
default[:'ehmp-ui_provision'][:'ehmp-ui'][:aws][:ssh_username] = "ec2-user"
default[:'ehmp-ui_provision'][:'ehmp-ui'][:aws][:ssh_keyname] = "vagrantaws_c82a142d5205"
default[:'ehmp-ui_provision'][:'ehmp-ui'][:aws][:ssh_key_path] = "#{ENV['HOME']}/Projects/vistacore/.chef/keys/#{node[:'ehmp-ui_provision'][:'ehmp-ui'][:aws][:ssh_keyname]}"
#######################################################################################################################

#######################################################################################################################
# ehmp-ui specific vagrant configuration options
default[:'ehmp-ui_provision'][:'ehmp-ui'][:vagrant][:ip_address] = "IP_ADDRESS"
default[:'ehmp-ui_provision'][:'ehmp-ui'][:vagrant][:provider_config] = {
  :memory => 256
}
default[:'ehmp-ui_provision'][:'ehmp-ui'][:vagrant][:shared_folders] = []
#######################################################################################################################
