#
# Cookbook Name:: ehmp_provision
# Recipe:: vxsync
#

chef_gem "chef-provisioning-ssh"
require 'chef/provisioning/ssh_driver'

_host_path_private_licenses = "#{ENV['HOME']}/Projects/vistacore/private_licenses"
node.default[:ehmp_provision][:vxsync][:vagrant][:shared_folders].push(
  {
    :host_path => _host_path_private_licenses,
    :guest_path => "/opt/private_licenses",
    :create => true
  }
)

############################################## Staging Artifacts #############################################
if ENV.has_key?('VX_SYNC_LOCAL_FILE')
  node.default[:ehmp_provision][:vxsync][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['VX_SYNC_LOCAL_FILE'])}" => ENV['VX_SYNC_LOCAL_FILE']
  })
  vxsync_source = "file:///tmp/#{File.basename(ENV['VX_SYNC_LOCAL_FILE'])}"
else
  vxsync_source = artifact_url(node[:ehmp_provision][:artifacts][:vxsync])
end

if ENV.has_key?('SOAP_HANDLER_LOCAL_FILE')
  node.default[:ehmp_provision][:vxsync][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['SOAP_HANDLER_LOCAL_FILE'])}" => ENV['SOAP_HANDLER_LOCAL_FILE']
  })
  soap_handler_source = "file:///tmp/#{File.basename(ENV['SOAP_HANDLER_LOCAL_FILE'])}"
else
  soap_handler_source = artifact_url(node[:ehmp_provision][:artifacts][:soap_handler])
end

if ENV.has_key?('ASU_LOCAL_FILE')
  node.default[:ehmp_provision][:vxsync][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['ASU_LOCAL_FILE'])}" => ENV['ASU_LOCAL_FILE']
  })
  asu_source = "file:///tmp/#{File.basename(ENV['ASU_LOCAL_FILE'])}"
else
  asu_source = artifact_url(node[:ehmp_provision][:artifacts][:asu])
end

############################################## Staging Artifacts #############################################

machine_ident = "vxsync"

boot_options = node[:ehmp_provision][machine_ident.to_sym]["#{node[:machine][:driver]}".to_sym]
node.default[:ehmp_provision][:vxsync][:copy_files].merge!(node[:machine][:copy_files])

machine_deps = parse_dependency_versions "machine"
ehmp_deps = parse_dependency_versions "ehmp_provision"

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:machine][:allow_web_access]
r_list << "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]"
r_list << "role[vxsync]"
if ENV.has_key?("RESET_SYNC")
  r_list << "recipe[vxsync::reset_vxsync@#{ehmp_deps["vxsync"]}]"
else
  r_list << "recipe[vxsync::clear_logs@#{ehmp_deps["vxsync"]}]" if node[:machine][:driver] == "aws"
  r_list << "recipe[vxsync@#{ehmp_deps["vxsync"]}]"
  unless node[:machine][:driver] == "ssh" || ENV.has_key?("NO_RESET")
    r_list << "recipe[vxsync::reset_vxsync@#{ehmp_deps["vxsync"]}]"
  end
end
r_list << "recipe[packages::upload@#{machine_deps["packages"]}]" if node[:machine][:cache_upload]

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
    vxsync: {
      source: vxsync_source,
      profile: ENV["VXSYNC_PROFILE"]
    },
    soap_handler: {
      source: soap_handler_source
    },
    asu: {
      source: asu_source
    }

  )
  files lazy { node[:ehmp_provision][:vxsync][:copy_files] }
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
