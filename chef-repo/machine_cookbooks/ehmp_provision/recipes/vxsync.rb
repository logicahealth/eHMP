#
# Cookbook Name:: ehmp_provision
# Recipe:: vxsync
#

require 'chef/provisioning/ssh_driver'

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

vxsync_attributes = {
  source: vxsync_source,
  clear_logs: node[:machine][:driver] == "aws"
}

primary_vxsync_client = true
unless db_item.nil?
  db_attributes = Chef::EncryptedDataBagItem.load("vxsync_env", db_item, node[:common][:data_bag_string])
  node.override[:machine] = Chef::Mixin::DeepMerge.hash_only_merge(node[:machine], db_attributes["machine"]) unless db_attributes["machine"].nil?
  node.override[:ehmp_provision][:vxsync][:vxsync_applications] = db_attributes["vxsync"]["vxsync_applications"] unless (db_attributes["vxsync"].nil? || db_attributes["vxsync"]["vxsync_applications"].nil?)

  # if we are using a db_item, deployed machine is not primary vxsync client unless it has the primary_vxsync_client attribute set
  if !(node[:ehmp_provision][:vxsync][:vxsync_applications].include?("client") && db_attributes["vxsync"]["primary_vxsync_client"] == true)
    primary_vxsync_client = false
  end

  # if the vxsync machine only contains vista and not client, set port to 5002
  if node[:ehmp_provision][:vxsync][:vxsync_applications] == ["vista"]
    vxsync_attributes[:beanstalk_processes] = {
      :jobrepo => {
        :config => {
          :port => 5002
        }
      }
    }
  end

  vxsync_attributes = Chef::Mixin::DeepMerge.hash_only_merge(vxsync_attributes, db_attributes["vxsync"])
  client_attributes = db_attributes["vxsync_client"]
  vista_attributes = db_attributes["vxsync_vista"]
end

if ENV.has_key?('INCLUDE_ASU')
  include_asu = true
else
  include_asu = find_optional_nodes_by_criteria(node[:machine][:stack], 'role:asu', 'role:vxsync_client') == [] && primary_vxsync_client
end

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:simulated_ssh_driver].nil? && (node[:machine][:allow_web_access] || node[:machine][:driver] == "ssh")
r_list << (node[:simulated_ssh_driver] ? "recipe[role_cookbook::aws@#{machine_deps["role_cookbook"]}]" : "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]")
node[:ehmp_provision][:vxsync][:vxsync_applications].each { |app| r_list << "role[vxsync_#{app}]" }
r_list << "role[primary_vxsync_client]" if primary_vxsync_client
r_list << "role[vxsync_error_processor]" if primary_vxsync_client
r_list << "role[asu]" if include_asu
if ENV.has_key?("RESET_SYNC")
  node[:ehmp_provision][:vxsync][:vxsync_applications].each { |app| r_list << "recipe[vxsync_#{app}::reset_sync@#{ehmp_deps["vxsync_#{app}"]}]" }
  r_list << "recipe[vxsync::reset_vxsync@#{ehmp_deps["vxsync"]}]"
  r_list << "recipe[asu::default@#{ehmp_deps["asu"]}]" if include_asu
else
  r_list << "recipe[vxsync::clear_logs@#{ehmp_deps["vxsync"]}]" if node[:machine][:driver] == "aws"
  r_list << "recipe[vxsync@#{ehmp_deps["vxsync"]}]"
  r_list << "recipe[beanstalk@#{ehmp_deps["beanstalk"]}]"
  node[:ehmp_provision][:vxsync][:vxsync_applications].each { |app| r_list << "recipe[vxsync_#{app}@#{ehmp_deps["vxsync_#{app}"]}]" }
  r_list << "recipe[osync@#{ehmp_deps["osync"]}]" if node[:ehmp_provision][:vxsync][:vxsync_applications].include?("client")
  r_list << "recipe[soap_handler@#{ehmp_deps["soap_handler"]}]"
  r_list << "recipe[vxsync::reset_vxsync@#{ehmp_deps["vxsync"]}]"
  r_list << "recipe[asu::install@#{ehmp_deps["asu"]}]" if include_asu
  r_list << "recipe[asu::uninstall@#{ehmp_deps["asu"]}]" unless include_asu
end
r_list << "recipe[packages::upload@#{machine_deps["packages"]}]" if node[:machine][:cache_upload]
r_list << "recipe[packages::remove_localrepo@#{machine_deps["packages"]}]" if node[:machine][:driver] == "ssh" && node[:simulated_ssh_driver].nil?

if ENV.has_key?("NO_RESET")
  reset = false
elsif node[:machine][:driver] == "ssh" && !node[:mocked_data_servers]
  reset = false
else
  reset = true
end

if node[:machine][:driver] == "ssh"
  appointment_scheduling_hash = {}
  admissions_hash = {}
else
  appointment_scheduling_hash = {
    :'C877,9E7A' => {
      :enabled => true,
      :weekday => '*',
      :hour => '3',
      :minute => '30',
      :log_file => 'osync-appointment_scheduling.log'
    }
  }
  admissions_hash = {
    :'C877,9E7A' => {
      :enabled => true,
      :minute => "30",
      :hour => "0",
      :weekday => "*",
      :log_file => "osync-admission-C877-9E7A.log"
    }
  }
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
    machine_ident: machine_ident,
    stack: node[:machine][:stack],
    nexus_url: node[:common][:nexus_url],
    data_bag_string: node[:common][:data_bag_string],
    reset_vxsync: {
      reset: reset
    },
    db_item: db_item,
    vxsync: vxsync_attributes,
    vxsync_client: client_attributes,
    vxsync_vista: vista_attributes,
    soap_handler: {
      source: soap_handler_source
    },
    asu: {
      source: asu_source
    },
    beats: {
      logging: node[:machine][:logging]
    },
    osync: {
      appointment_scheduling: appointment_scheduling_hash,
      admissions: admissions_hash
    },
    yum_wrapper: {
      vistacore: {
        reponame: node[:machine][:staging]
      }
    }
  )
  files lazy { node[:ehmp_provision][:vxsync][:copy_files] }
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
