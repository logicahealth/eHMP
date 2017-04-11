#
# Cookbook Name:: ehmp_provision
# Recipe:: jds
#

chef_gem "chef-provisioning-ssh"
require 'chef/provisioning/ssh_driver'

############################################## Staging Artifacts #############################################
if ENV.has_key?('JDS_LOCAL_FILE')
  node.default[:ehmp_provision][:jds][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['JDS_LOCAL_FILE'])}" => ENV['JDS_LOCAL_FILE']
  })
  jds_source = "file:///tmp/#{File.basename(ENV['JDS_LOCAL_FILE'])}"
else
  jds_source = artifact_url(node[:ehmp_provision][:artifacts][:jds])
end

if ENV.has_key?('JDS_DATA_LOCAL_FILE')
  node.default[:ehmp_provision][:jds][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['JDS_DATA_LOCAL_FILE'])}" => ENV['JDS_DATA_LOCAL_FILE']
  })
  jds_data_source = "file:///tmp/#{File.basename(ENV['JDS_DATA_LOCAL_FILE'])}"
else
  jds_data_source = artifact_url(node[:ehmp_provision][:artifacts][:jds_data])
end
############################################## Staging Artifacts #############################################

machine_ident = "jds"

boot_options = node[:ehmp_provision][machine_ident.to_sym]["#{node[:machine][:driver]}".to_sym]
node.default[:ehmp_provision][:jds][:copy_files].merge!(node[:machine][:copy_files])

machine_deps = parse_dependency_versions "machine"
ehmp_deps = parse_dependency_versions "ehmp_provision"

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:machine][:allow_web_access]
r_list << "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]"
r_list << "role[jds]"
if node[:machine][:driver] == "vagrant" and !ENV.has_key?("NO_RESET")
  r_list << "recipe[jds::reset_sync@#{ehmp_deps["jds"]}]"
end
r_list << "recipe[jds@#{ehmp_deps["jds"]}]"
r_list << "recipe[jds::pjds@#{ehmp_deps["jds"]}]" if node[:machine][:driver] == "vagrant"
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
    jds: {
      source: jds_source,
      jds_data: {
        source: node[:machine][:driver] == "vagrant" ? jds_data_source : ""
      }
    },
    beats: {
      logging: node[:machine][:logging]
    }
  )
  files lazy { node[:ehmp_provision][:jds][:copy_files] }
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
