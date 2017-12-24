#
# Cookbook Name:: rdk_provision
# Recipe:: write-back
#

require 'chef/provisioning/ssh_driver'

####################################################### Shared Folders #########################################################
if ENV['DEV_DEPLOY']
  node.default[:rdk_provision][:write_back][:vagrant][:shared_folders].push(
    {
      :host_path => "#{ENV['HOME']}/Projects/vistacore/rdk/product/production/rdk",
      :guest_path => "/opt/write_back",
      :create => true,
      :owner => 'node',
      :group => 'node'
    },
    {
      :host_path => "#{ENV['HOME']}/Projects/vistacore/rdk/product/production/rdk",
      :guest_path => "/opt/vista_aso_rejector",
      :create => true,
      :owner => 'node',
      :group => 'node'
    }
  )
end
######################################################## Shared Folders ########################################################

machine_ident = ENV['WRITE_BACK_IDENT'] || "write-back"

boot_options = node[:rdk_provision][:write_back]["#{node[:machine][:driver]}".to_sym]
node.default[:rdk_provision][:write_back][:copy_files].merge!(node[:machine][:copy_files])

machine_deps = parse_dependency_versions "machine"
rdk_deps = parse_dependency_versions "rdk_provision"

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:simulated_ssh_driver].nil? && (node[:machine][:allow_web_access] || node[:machine][:driver] == "ssh")
r_list << (node[:simulated_ssh_driver] ? "recipe[role_cookbook::aws@#{machine_deps["role_cookbook"]}]" : "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]")
r_list << "role[write_back]"
r_list << "role[vista_aso_rejector]"
r_list << "recipe[postfix_wrapper]" if ENV.has_key?("CONFIGURE_POSTFIX")
r_list << "recipe[write_back::clear_logs@#{rdk_deps["write_back"]}]" if node[:machine][:driver] == "aws"
r_list << "recipe[write_back@#{rdk_deps["write_back"]}]"
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
          :prefix => 'sudo '
        }
      },
      :convergence_options => node[:machine][:convergence_options]
    }
  }
  attributes(
    stack: node[:machine][:stack],
    allow_ldap_access: node[:machine][:allow_ldap_access],
    nexus_url: node[:common][:nexus_url],
    data_bag_string: node[:common][:data_bag_string],
    dev_deploy: ENV['DEV_DEPLOY'] == "true" ? true : false,
    using_vagrant: node[:machine][:driver] == "vagrant",
    db_env: {
      :write_back_env => ENV['WRITE_BACK_DB_ITEM']
    },
    write_back: {
      source: artifact_url(node[:rdk_provision][:artifacts][:rdk]),
      version: ENV['RDK_VERSION']
    },
    vista_aso_rejector: {
      source: artifact_url(node[:rdk_provision][:artifacts][:rdk])
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
  files lazy { node[:rdk_provision][:write_back][:copy_files] }
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
