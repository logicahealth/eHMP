#
# Cookbook Name:: ehmp_provision
# Recipe:: vxsync
#

chef_gem "chef-provisioning-ssh"
require 'chef/provisioning/ssh_driver'

include_asu = find_optional_node_by_criteria(node[:machine][:stack], 'role:asu', 'role:vxsync_client').nil? && node[:ehmp_provision][:vxsync][:vxsync_applications].include?("client")

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


boot_options = node[:ehmp_provision][:vxsync]["#{node[:machine][:driver]}".to_sym]
node.default[:ehmp_provision][:vxsync][:copy_files].merge!(node[:machine][:copy_files])

machine_deps = parse_dependency_versions "machine"
ehmp_deps = parse_dependency_versions "ehmp_provision"

machine_ident = ENV['VXSYNC_IDENT'] || "vxsync"
db_item = ENV['VXSYNC_DB_ITEM'] || ENV['VXSYNC_IDENT']

unless db_item.nil?
  db_attributes = Chef::EncryptedDataBagItem.load("vxsync_env", db_item, node[:common][:data_bag_string])
  node.override[:machine] = Chef::Mixin::DeepMerge.hash_only_merge(node[:machine], db_attributes["machine"]) unless db_attributes["machine"].nil?
  node.override[:ehmp_provision][:vxsync][:vxsync_applications] = db_attributes["vxsync"]["vxsync_applications"] unless (db_attributes["vxsync"].nil? || db_attributes["vxsync"]["vxsync_applications"].nil?)
end

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:machine][:allow_web_access] || node[:machine][:driver] == "ssh"
r_list << "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]"
node[:ehmp_provision][:vxsync][:vxsync_applications].each { |app| r_list << "role[vxsync_#{app}]" }
r_list << "role[asu]" if include_asu
if ENV.has_key?("RESET_SYNC")
  r_list << "recipe[vxsync::reset_vxsync@#{ehmp_deps["vxsync"]}]"
  r_list << "recipe[asu::default@#{ehmp_deps["asu"]}]"
else
  r_list << "recipe[vxsync::clear_logs@#{ehmp_deps["vxsync"]}]" if node[:machine][:driver] == "aws"
  r_list << "recipe[vxsync@#{ehmp_deps["vxsync"]}]"
  r_list << "recipe[vxsync::reset_vxsync@#{ehmp_deps["vxsync"]}]"
  r_list << "recipe[asu::install@#{ehmp_deps["asu"]}]" if include_asu
  r_list << "recipe[asu::uninstall@#{ehmp_deps["asu"]}]" unless include_asu
end
r_list << "recipe[packages::upload@#{machine_deps["packages"]}]" if node[:machine][:cache_upload]
r_list << "recipe[packages::remove_localrepo@#{machine_deps["packages"]}]" if node[:machine][:driver] == "ssh"

if ENV.has_key?("NO_RESET")
  reset = false
elsif node[:machine][:driver] == "ssh" && !node[:mocked_data_servers]
  reset = false
else
  reset = true
end

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
    reset_vxsync: {
      reset: reset
    },
    db_item: db_item,
    vxsync: {
      source: vxsync_source,
      clear_logs: node[:machine][:driver] == "aws"
    },
    soap_handler: {
      source: soap_handler_source
    },
    asu: {
      source: asu_source
    },
    beats: {
      logging: node[:machine][:logging]
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
