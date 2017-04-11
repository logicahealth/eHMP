#
# Cookbook Name:: ehmp_provision
# Recipe:: solr
#

require 'chef/provisioning/ssh_driver'

include_zk = find_optional_nodes_by_criteria(node[:machine][:stack], 'role:zookeeper', 'role:solr').empty?

############################################## Staging Artifacts #############################################
if ENV.has_key?('HEALTH_TIME_CORE_LOCAL_FILE')
  node.default[:ehmp_provision][:solr][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['HEALTH_TIME_CORE_LOCAL_FILE'])}" => ENV['HEALTH_TIME_CORE_LOCAL_FILE']
  })
  health_time_core_source = "file:///tmp/#{File.basename(ENV['HEALTH_TIME_CORE_LOCAL_FILE'])}"
else
  health_time_core_source = artifact_url(node[:ehmp_provision][:artifacts][:health_time_core])
end

if ENV.has_key?('HEALTH_TIME_SOLR_LOCAL_FILE')
  node.default[:ehmp_provision][:solr][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['HEALTH_TIME_SOLR_LOCAL_FILE'])}" => ENV['HEALTH_TIME_SOLR_LOCAL_FILE']
  })
  health_time_solr_source = "file:///tmp/#{File.basename(ENV['HEALTH_TIME_SOLR_LOCAL_FILE'])}"
else
  health_time_solr_source = artifact_url(node[:ehmp_provision][:artifacts][:health_time_solr])
end

if ENV.has_key?('VPR_LOCAL_FILE')
  node.default[:ehmp_provision][:solr][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['VPR_LOCAL_FILE'])}" => ENV['VPR_LOCAL_FILE']
  })
  vpr_source = "file:///tmp/#{File.basename(ENV['VPR_LOCAL_FILE'])}"
else
  vpr_source = artifact_url(node[:ehmp_provision][:artifacts][:vpr])
end
############################################## Staging Artifacts #############################################

machine_ident = "solr"

boot_options = node[:ehmp_provision][machine_ident.to_sym]["#{node[:machine][:driver]}".to_sym]
node.default[:ehmp_provision][:solr][:copy_files].merge!(node[:machine][:copy_files])

machine_deps = parse_dependency_versions "machine"
ehmp_deps = parse_dependency_versions "ehmp_provision"

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:machine][:allow_web_access] || node[:machine][:driver] == "ssh"
r_list << "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]"
r_list << "role[solr]"
r_list << "role[zookeeper]" if include_zk
r_list << "recipe[zookeeper@#{ehmp_deps["zookeeper"]}]" if include_zk
r_list << "recipe[zookeeper::uninstall@#{ehmp_deps["zookeeper"]}]" unless include_zk
r_list << "recipe[vx_solr@#{ehmp_deps["vx_solr"]}]"
r_list << "recipe[packages::upload@#{machine_deps["packages"]}]" if node[:machine][:cache_upload]
r_list << "recipe[packages::remove_localrepo@#{machine_deps["packages"]}]" if node[:machine][:driver] == "ssh"

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
    vx_solr: {
      ehmp: {
        vpr: vpr_source,
        health_time_core: health_time_core_source,
        health_time_solr: health_time_solr_source,
        collection: {
          # by default, only allow recreating solr collections when not using ssh driver
          allow_recreate: node[:machine][:driver] != "ssh"
        }
      }
    },
    beats: {
      logging: node[:machine][:logging]
    }
  )
  files lazy { node[:ehmp_provision][:solr][:copy_files] }
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
