#
# Cookbook Name:: ehmp-ui_provision
# Recipe:: ehmp-balancer
#

chef_gem "chef-provisioning-ssh"
require 'chef/provisioning/ssh_driver'

machine_ident = "ehmp-balancer"

boot_options = node[:'ehmp-ui_provision'][machine_ident.to_sym]["#{node[:machine][:driver]}".to_sym]
node.default[:'ehmp-ui_provision'][:'ehmp-balancer'][:copy_files].merge!(node[:machine][:copy_files])

machine_deps = parse_dependency_versions "machine"
ehmp_ui_deps = parse_dependency_versions "ehmp-ui_provision"

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:machine][:allow_web_access] || node[:machine][:driver] == "ssh"
r_list << "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]"
r_list << "role[ehmp-balancer]"
r_list << "recipe[ehmp_balancer@#{ehmp_ui_deps["ehmp_balancer"]}]"
r_list << "recipe[packages::upload@#{machine_deps["packages"]}]" if node[:machine][:cache_upload]
r_list << "recipe[packages::remove_localrepo@#{machine_deps["packages"]}]" if node[:machine][:driver] == "ssh"

machine_boot "boot #{machine_ident} machine to the #{node[:machine][:driver]} environment" do
  elastic_ip ENV["ELASTIC_IP"]
  machine_name machine_ident
  boot_options boot_options
  driver node[:machine][:driver]
  action node[:machine][:driver]
  only_if { node[:machine][:production_settings][machine_ident.to_sym].nil? }
end

# if the driver is 'vagrant', append -node- after the machine identify and before the stack name; else use only machine-stack
machine_name = node[:machine][:driver] == "vagrant" ? "#{machine_ident}-#{node[:machine][:stack]}-node" : "#{machine_ident}-#{node[:machine][:stack]}"
machine machine_name do
  driver "ssh"
  converge node[:machine][:converge]
  machine_options lazy {
    {
      :transport_options => {
        :ip_address => node[:machine][:production_settings][machine_ident.to_sym][:ip],
        :username => node[:machine][:production_settings][machine_ident.to_sym][:ssh_username],
        :ssh_options => {
          :keys => [
            node[:machine][:production_settings][machine_ident.to_sym][:ssh_key]
          ],
        },
        :options => {
          :prefix => 'sudo ',
        }
      },
      :convergence_options => node[:machine][:convergence_options]
    }
  }
  attributes(
    stack: node[:machine][:stack],
    nexus_url: node[:common][:nexus_url],
    data_bag_string: node[:common][:data_bag_string],
    beats: {
      logging: node[:machine][:logging]
    }
  )
  files lazy { node[:'ehmp-ui_provision'][:'ehmp-balancer'][:copy_files] }
  chef_environment node[:machine][:environment]
  run_list r_list
  action node[:machine][:action]
end

chef_node machine_name do
  action :delete
  only_if {
    node[:machine][:action].eql?("destroy") && node[:machine][:driver].eql?("vagrant")
  }
end
