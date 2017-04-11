#
# Cookbook Name:: chef-repo_provision
# Recipe:: jenkins
#

chef_gem "chef-provisioning-ssh"
require 'chef/provisioning/ssh_driver'

machine_ident = "jenkins"

boot_options = node['chef-repo_provision'][machine_ident.to_sym]["#{node[:machine][:driver]}".to_sym]
node.default['chef-repo_provision'][:jenkins][:copy_files].merge!(node[:machine][:copy_files])

machine_deps = parse_dependency_versions "machine"
chef_repo_deps = parse_dependency_versions "chef-repo_provision"

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:machine][:allow_web_access] || node[:machine][:driver] == "ssh"
r_list << "recipe[jenkins_wrapper@#{chef_repo_deps["jenkins_wrapper"]}]"
r_list << "recipe[packages::upload@#{machine_deps["packages"]}]" if node[:machine][:cache_upload]

machine_boot "boot #{machine_ident} machine to the #{node[:machine][:driver]} environment" do
  machine_name machine_ident
  boot_options boot_options
  driver node[:machine][:driver]
  action node[:machine][:driver]
  only_if { node[:machine][:production_settings][machine_ident.to_sym].nil? }
end

# if the driver is 'vagrant', append -node- after the machine identify and before the stack name; else use only machine-stack
machine_name = node[:machine][:driver] == "vagrant" ? "#{machine_ident}-#{node[:machine][:stack]}-node" : "#{machine_ident}-#{node[:machine][:stack]}"

p "-----------"
p "Machine_name: #{machine_name} ----------- driver: #{node[:machine][:driver]}"

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
    data_bag_string: node[:common][:data_bag_string]
  )
  files lazy { node['chef-repo_provision'][:jenkins][:copy_files] }
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
