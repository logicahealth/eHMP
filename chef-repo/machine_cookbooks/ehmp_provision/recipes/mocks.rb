#
# Cookbook Name:: ehmp_provision
# Recipe:: mocks
#

chef_gem "chef-provisioning-ssh"
require 'chef/provisioning/ssh_driver'

include_solr = find_optional_node_by_role("solr", node[:machine][:stack]).nil? and node[:machine][:driver] == "vagrant"

############################################## Staging Artifacts #############################################
if include_solr
  if ENV.has_key?('HEALTH_TIME_CORE_LOCAL_FILE')
    node.default[:ehmp_provision][:mocks][:copy_files].merge!({
      "/tmp/#{File.basename(ENV['HEALTH_TIME_CORE_LOCAL_FILE'])}" => ENV['HEALTH_TIME_CORE_LOCAL_FILE']
    })
    health_time_core_source = "file:///tmp/#{File.basename(ENV['HEALTH_TIME_CORE_LOCAL_FILE'])}"
  else
    health_time_core_source = artifact_url(node[:ehmp_provision][:artifacts][:health_time_core])
  end

  if ENV.has_key?('HEALTH_TIME_SOLR_LOCAL_FILE')
    node.default[:ehmp_provision][:mocks][:copy_files].merge!({
      "/tmp/#{File.basename(ENV['HEALTH_TIME_SOLR_LOCAL_FILE'])}" => ENV['HEALTH_TIME_SOLR_LOCAL_FILE']
    })
    health_time_solr_source = "file:///tmp/#{File.basename(ENV['HEALTH_TIME_SOLR_LOCAL_FILE'])}"
  else
    health_time_solr_source = artifact_url(node[:ehmp_provision][:artifacts][:health_time_solr])
  end

  if ENV.has_key?('VPR_LOCAL_FILE')
    node.default[:ehmp_provision][:mocks][:copy_files].merge!({
      "/tmp/#{File.basename(ENV['VPR_LOCAL_FILE'])}" => ENV['VPR_LOCAL_FILE']
    })
    vpr_source = "file:///tmp/#{File.basename(ENV['VPR_LOCAL_FILE'])}"
  else
    vpr_source = artifact_url(node[:ehmp_provision][:artifacts][:vpr])
  end
end

if ENV.has_key?('CORRELATED_IDS_LOCAL_FILE')
  node.default[:ehmp_provision][:mocks][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['CORRELATED_IDS_LOCAL_FILE'])}" => ENV['CORRELATED_IDS_LOCAL_FILE']
  })
  correlated_ids_source = "file:///tmp/#{File.basename(ENV['CORRELATED_IDS_LOCAL_FILE'])}"
else
  correlated_ids_source = artifact_url(node[:ehmp_provision][:artifacts][:correlated_ids])
end
############################################## Staging Artifacts #############################################

############################################################### Shared Folders #################################################################
version = ENV['NODEMOCKSERVICES_VERSION']

node.default[:ehmp_provision][:mocks][:vagrant][:shared_folders].push(
  {
    :host_path => File.expand_path("#{ENV['HOME']}/Projects/vistacore/ehmp/product/production/NodeMockServices/", File.dirname(__FILE__)),
    :guest_path => "/opt/mocks_server",
    :create => true
  },
  {
    :host_path => "#{ENV['HOME']}/Projects/vistacore/private_licenses",
    :guest_path => "/opt/private_licenses",
    :create => true
  }
)
############################################################### Shared Folders #################################################################

machine_ident = "mocks"

boot_options = node[:ehmp_provision][machine_ident.to_sym]["#{node[:machine][:driver]}".to_sym]
node.default[:ehmp_provision][:mocks][:copy_files].merge!(node[:machine][:copy_files])

machine_deps = parse_dependency_versions "machine"
ehmp_deps = parse_dependency_versions "ehmp_provision"

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:machine][:allow_web_access]
r_list << "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]"
r_list << "role[mocks]"
r_list << "recipe[mocks@#{ehmp_deps["mocks"]}]"
r_list << "recipe[vx_solr@#{ehmp_deps["vx_solr"]}]" if include_solr
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
    mocks: {
      node_services: {
        source: artifact_url(node[:ehmp_provision][:artifacts][:nodemockservices])
      },
      correlated_ids: {
        source: correlated_ids_source
      }
    },
    hdr: {
      hdr_sites: [
        {
           site_id: "2939",
           station_number: 536
        },
        {
           site_id: "FFC7",
           station_number: 551
        }
      ]
    },
    vx_solr: {
      ehmp: {
        vpr: vpr_source,
        health_time_core: health_time_core_source,
        health_time_solr: health_time_solr_source
      }
    }
  )
  files lazy { node[:ehmp_provision][:mocks][:copy_files] }
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
