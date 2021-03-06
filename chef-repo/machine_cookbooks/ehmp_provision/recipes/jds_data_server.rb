#
# Cookbook Name:: ehmp_provision
# Recipe:: jds_data_server
#

require 'chef/provisioning/ssh_driver'

node.default[:machine][:block_device_mappings] = [{
  device_name: '/dev/sda1',
  ebs: {
    volume_size: 100 # 100 GB
  }
}]

boot_options = node[:ehmp_provision][:jds_data_server]["#{node[:machine][:driver]}".to_sym]
node.default[:ehmp_provision][:jds_data_server][:copy_files].merge!(node[:machine][:copy_files])

machine_deps = parse_dependency_versions "machine"
ehmp_deps = parse_dependency_versions "ehmp_provision"

machine_ident = ENV['JDS_DATA_SERVER_IDENT'] || "jds_data_server"

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:simulated_ssh_driver].nil? && (node[:machine][:allow_web_access] || node[:machine][:driver] == "ssh")
r_list << (node[:simulated_ssh_driver] ? "recipe[role_cookbook::aws@#{machine_deps["role_cookbook"]}]" : "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]")
r_list << "role[jds_data_server]"
r_list << "recipe[jds::jds_data_server@#{ehmp_deps["jds"]}]"
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
    db_env: {
      :jds_env => ENV["JDS_DB_ITEM"]
    },
    jds: {
        jds_data_server_ident: machine_ident,
        jds_database_location: "/usr/jdsdbs",
        ecp: {
          ordinality: ENV['ORDINALITY'] || 1
        }
    },
    beats: {
      logging: node[:machine][:logging]
    },
    yum_wrapper: {
      vistacore: {
        reponame: node[:machine][:staging]
      }
    }
  )
  files lazy { node[:ehmp_provision][:jds][:copy_files] }
  chef_environment node[:machine][:environment]
  run_list r_list
  action node[:machine][:action]
  only_if { ["converge","setup"].include?(node[:machine][:action].to_s) }
end

chef_node machine_name do
  action :delete
  only_if {
    node[:machine][:action].eql?("destroy")
  }
end
