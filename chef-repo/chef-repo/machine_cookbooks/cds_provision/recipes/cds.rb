#
# Cookbook Name:: cds_provision
# Recipe:: cds
#

require 'chef/provisioning/ssh_driver'

# ############################################## Staging Artifacts #############################################
if ENV.has_key?('CDSDASHBOARD_LOCAL_FILE')
  node.default[:cds_provision][:cds][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['CDSDASHBOARD_LOCAL_FILE'])}" => ENV['CDSDASHBOARD_LOCAL_FILE']
  })
  cdsdashboard_source = "file:///tmp/#{File.basename(ENV['CDSDASHBOARD_LOCAL_FILE'])}"
else
  cdsdashboard_source = artifact_url(node[:cds_provision][:artifacts][:cdsdashboard])
end

if ENV.has_key?('CDSI_METRICS_LOCAL_FILE')
  node.default[:cds_provision][:cds][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['CDSI_METRICS_LOCAL_FILE'])}" => ENV['CDSI_METRICS_LOCAL_FILE']
  })
  cdsi_metrics_source = "file:///tmp/#{File.basename(ENV['CDSI_METRICS_LOCAL_FILE'])}"
else
  cdsi_metrics_source = artifact_url(node[:cds_provision][:artifacts][:cdsi_metrics])
end

if ENV.has_key?('CDSI_RESULTS_LOCAL_FILE')
  node.default[:cds_provision][:cds][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['CDSI_RESULTS_LOCAL_FILE'])}" => ENV['CDSI_RESULTS_LOCAL_FILE']
  })
  cdsi_results_source = "file:///tmp/#{File.basename(ENV['CDSI_RESULTS_LOCAL_FILE'])}"
else
  cdsi_results_source = artifact_url(node[:cds_provision][:artifacts][:cdsi_results])
end

if ENV.has_key?('DEV_DEPLOY')
  node.default[:cds_provision][:cds][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['OPENCDS_LOCAL_FILE'])}" => ENV['OPENCDS_LOCAL_FILE'],
    "/tmp/#{File.basename(ENV['CDS_ENGINE_AGENT_LOCAL_FILE'])}" => ENV['CDS_ENGINE_AGENT_LOCAL_FILE']
  })
  opencds_knowledge_repository_data_source = "file:///tmp/#{File.basename(ENV['OPENCDS_LOCAL_FILE'])}"
else
  opencds_knowledge_repository_data_source = artifact_url(node[:cds_provision][:artifacts][:opencds_knowledge_repository_data])
end

if ENV.has_key?('CDS_ENGINE_AGENT_LOCAL_FILE')
  node.default[:cds_provision][:cds][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['CDS_ENGINE_AGENT_LOCAL_FILE'])}" => ENV['CDS_ENGINE_AGENT_LOCAL_FILE']
  })
  cds_engine_agent_source = "file:///tmp/#{File.basename(ENV['CDS_ENGINE_AGENT_LOCAL_FILE'])}"
else
  cds_engine_agent_source = artifact_url(node[:cds_provision][:artifacts][:cds_engine_agent])
end
# ############################################## Staging Artifacts #############################################

machine_ident = "cds"

boot_options = node[:cds_provision][machine_ident.to_sym]["#{node[:machine][:driver]}".to_sym]
node.default[:cds_provision][:cds][:copy_files].merge!(node[:machine][:copy_files])

machine_deps = parse_dependency_versions "machine"
cds_deps = parse_dependency_versions "cds_provision"

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:machine][:allow_web_access] || node[:machine][:driver] == "ssh"
r_list << "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]"
r_list << "role[opencds]"
r_list << "role[cdsdb]"
r_list << "role[cdsinvocation]"
r_list << "role[cdsdashboard]"
r_list << "recipe[opencds@#{cds_deps["opencds"]}]"
r_list << "recipe[cdsdb@#{cds_deps["cdsdb"]}]"
r_list << "recipe[cdsinvocation@#{cds_deps["cdsinvocation"]}]"
r_list << "recipe[cdsdashboard@#{cds_deps["cdsdashboard"]}]"
r_list << "recipe[packages::upload@#{machine_deps["packages"]}]" if node[:machine][:cache_upload]
r_list << "recipe[packages::remove_localrepo@#{machine_deps["packages"]}]" if node[:machine][:driver] == "ssh"

machine_boot "boot #{machine_ident} machine to the #{node[:machine][:driver]} environment" do
  machine_name machine_ident
  boot_options boot_options
  driver node[:machine][:driver]
  action node[:machine][:driver]
  only_if { node[:machine][:production_settings][machine_ident.to_sym].nil? }
end

if node[:machine][:driver] == "ssh"
  dev_cdsdb = false
else
  dev_cdsdb = true
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
    cdsdb: {
      dev_cdsdb: dev_cdsdb
    },
    opencds: {
      zip_source: opencds_knowledge_repository_data_source,
      cds_engine_agent_source: cds_engine_agent_source
    },
    cdsinvocation: {
      metrics: {
        source: cdsi_metrics_source
      },
      results: {
        source: cdsi_results_source
      }
    },
    cdsdashboard: {
      deploy_war: {
        source: cdsdashboard_source
      }
    },
    beats: {
      logging: node[:machine][:logging]
    }
  )
  files lazy { node[:cds_provision][:cds][:copy_files] }
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
