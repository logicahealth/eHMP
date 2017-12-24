#
# Cookbook Name:: ehmp_provision
# Recipe:: zookeeper
#

chef_gem "chef-provisioning-ssh"
require 'chef/provisioning/ssh_driver'

machine_deps = parse_dependency_versions "machine"
ehmp_deps = parse_dependency_versions "ehmp_provision"

machine_ident = ENV['ZOOKEEPER_IDENT'] || "zookeeper"
db_item = ENV['ZOOKEEPER_DB_ITEM'] || ENV['ZOOKEEPER_IDENT']

unless db_item.nil?
  db_attributes = Chef::EncryptedDataBagItem.load("zookeeper_env", db_item, node[:common][:data_bag_string])
  node.override[:ehmp_provision] = Chef::Mixin::DeepMerge.hash_only_merge(node[:ehmp_provision], db_attributes["ehmp_provision"]) unless db_attributes["ehmp_provision"].nil?
end

boot_options = node[:ehmp_provision][:zookeeper]["#{node[:machine][:driver]}".to_sym]
node.default[:ehmp_provision][:zookeeper][:copy_files].merge!(node[:machine][:copy_files])


r_list = []
r_list << "role[zookeeper]"
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:simulated_ssh_driver].nil? && (node[:machine][:allow_web_access] || node[:machine][:driver] == "ssh")
r_list << (node[:simulated_ssh_driver] ? "recipe[role_cookbook::aws@#{machine_deps["role_cookbook"]}]" : "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]")
r_list << "recipe[zookeeper@#{ehmp_deps["zookeeper"]}]" unless ENV['INITIAL_DEPLOY']
r_list << "recipe[packages::upload@#{machine_deps["packages"]}]" if node[:machine][:cache_upload]
r_list << "recipe[packages::remove_localrepo@#{machine_deps["packages"]}]" if node[:machine][:driver] == "ssh" && node[:simulated_ssh_driver].nil?

machine_boot "boot #{machine_ident} machine to the #{node[:machine][:driver]} environment" do
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
          :user_known_hosts_file => '/dev/null'
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
    },
    db_item: db_item,
    zookeeper: {
      ident: machine_ident
    },
    yum_wrapper: {
      vistacore: {
        reponame: node[:machine][:staging]
      }
    }
  )
  files lazy { node[:ehmp_provision][:zookeeper][:copy_files] }
  chef_environment node[:machine][:environment]
  run_list r_list
  action node[:machine][:action]
  only_if { node[:machine][:action].to_s.eql?("converge") }
end

chef_node machine_name do
  action :delete
  only_if {
    node[:machine][:action].eql?("destroy")
  }
end
