#
# Cookbook Name:: ehmp-ui_provision
# Recipe:: ehmp-ui
#

chef_gem "chef-provisioning-ssh"
require 'chef/provisioning/ssh_driver'

ui_version = ENV['EHMPUI_VERSION']
adk_version = ENV['ADK_VERSION']

############################################## Dev Shared Folders #############################################
if ENV['DEV_DEPLOY']
  node.default[:'ehmp-ui_provision'][:'ehmp-ui'][:copy_files] = {
    "#{node[:'ehmp-ui_provision'][:'ehmp-ui'][:adk_home]}/app.json" => {
      :local_path => "#{ENV['HOME']}/Projects/vistacore/ehmp-ui/product/production/app.json"
    }
  }
  if ENV['LOCAL_ADK']
    node.default[:'ehmp-ui_provision'][:'ehmp-ui'][:vagrant][:shared_folders].push(
      {
        :host_path => "#{ENV['HOME']}/Projects/vistacore/adk/product/production/",
        :guest_path => node[:'ehmp-ui_provision'][:'ehmp-ui'][:adk_home],
        :create => true
      }
    )
  end
  node.default[:'ehmp-ui_provision'][:'ehmp-ui'][:vagrant][:shared_folders].push(
    {
      :host_path => "#{ENV['HOME']}/Projects/vistacore/ehmp-ui/product/production/app/",
      :guest_path => node[:'ehmp-ui_provision'][:'ehmp-ui'][:ui_home],

    },
    {
      :host_path => "#{ENV['HOME']}/Projects/vistacore/ehmp-ui/product/production/assets/css/",
      :guest_path => "#{node[:'ehmp-ui_provision'][:'ehmp-ui'][:ui_home]}/css/",
      :create => true
    }
  )
end
############################################## Dev Shared Folders #############################################

machine_ident = "ehmp-ui"

boot_options = node[:'ehmp-ui_provision'][machine_ident.to_sym]["#{node[:machine][:driver]}".to_sym]
node.default[:'ehmp-ui_provision'][:'ehmp-ui'][:copy_files].merge!(node[:machine][:copy_files])

machine_deps = parse_dependency_versions "machine"
ehmp_ui_deps = parse_dependency_versions "ehmp-ui_provision"

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:machine][:allow_web_access] || node[:machine][:driver] == "ssh"
r_list << "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]"
r_list << "role[ehmp-ui]"
r_list << "role[ehmp-balancer]" if node[:machine][:driver] == "vagrant"
r_list << "recipe[ehmp-ui@#{ehmp_ui_deps["ehmp-ui"]}]"
r_list << "recipe[ehmp_balancer@#{ehmp_ui_deps["ehmp_balancer"]}]" if node[:machine][:driver] == "vagrant"
r_list << "recipe[packages::upload@#{machine_deps["packages"]}]" if node[:machine][:cache_upload]
r_list << "recipe[packages::remove_localrepo@#{machine_deps["packages"]}]" if node[:machine][:driver] == "ssh"

machine_boot "boot #{machine_ident} machine to the #{node[:machine][:driver]} environment" do
  machine_name machine_ident
  boot_options boot_options
  driver node[:machine][:driver]
  action node[:machine][:driver]
  only_if { node[:machine][:production_settings][machine_ident.to_sym].nil? }
end

ehmp_ui_manifest do
  path "/tmp/manifest.json"
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
    ehmp_ui: {
      home_dir: node[:'ehmp-ui_provision'][:'ehmp-ui'][:ui_home],
      source: artifact_url(node[:'ehmp-ui_provision'][:artifacts][:'ehmp-ui']),
      manifest: {
        versions: node[:'ehmp-ui_provision'][:manifest][:versions],
        overall_version: node[:'ehmp-ui_provision'][:manifest][:overall_version]
      }
    },
    adk: {
      source: artifact_url(node[:'ehmp-ui_provision'][:artifacts][:adk]),
      home_dir: node[:'ehmp-ui_provision'][:'ehmp-ui'][:adk_home],
      dir: "ehmp-ui",
      port: "80"
    },
    apache: {
      listen_ports: [
        "80"
      ]
    },
    beats: {
      logging: node[:machine][:logging]
    }
  )
  files lazy { node[:'ehmp-ui_provision'][:'ehmp-ui'][:copy_files] }
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
