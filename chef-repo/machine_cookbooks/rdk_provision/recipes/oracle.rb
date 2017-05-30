#
# Cookbook Name:: rdk_provision
# Recipe:: oracle
#

require 'chef/provisioning/ssh_driver'

raise "You must destroy JBPM before you can deploy a seperate oracle" if (!find_optional_node_by_criteria( node[:machine][:stack], 'role:ehmp_oracle AND role:jbpm').nil?) && (ENV['ACTION'] != 'destroy')

############################################## Staging Artifacts #############################################
if ENV.has_key?('DEV_DEPLOY')
  node.default[:rdk_provision][:oracle][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['ORACLE_SQL_CONFIG_LOCAL_FILE'])}" => ENV['ORACLE_SQL_CONFIG_LOCAL_FILE']
  })
  oracle_sql_config_artifacts_source = "file:///tmp/#{File.basename(ENV['ORACLE_SQL_CONFIG_LOCAL_FILE'])}"
else
  oracle_sql_config_artifacts_source = artifact_url(node[:rdk_provision][:artifacts][:oracle_sql_config])
end
############################################## Staging Artifacts #############################################

machine_ident = "oracle"

boot_options = node[:rdk_provision][machine_ident.to_sym]["#{node[:machine][:driver]}".to_sym]
node.default[:rdk_provision][:oracle][:copy_files].merge!(node[:machine][:copy_files])

machine_deps = parse_dependency_versions "machine"
rdk_deps = parse_dependency_versions "rdk_provision"

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:machine][:allow_web_access] || node[:machine][:driver] == "ssh"
r_list << "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]"
if node[:machine][:driver] == "vagrant"
  oracle_cookbook = "oracle-xe_wrapper"
  oracle_sid = "XE"
else
  oracle_cookbook = "oracle_wrapper"
  oracle_sid = "JBPMDB"
end
r_list << "role[ehmp_oracle]"
r_list << "recipe[ehmp_oracle@#{rdk_deps["ehmp_oracle"]}]"
r_list << "recipe[packages::upload@#{machine_deps["packages"]}]" if node[:machine][:cache_upload]
r_list << "recipe[packages::remove_localrepo@#{machine_deps["packages"]}]" if node[:machine][:driver] == "ssh"

machine_boot "boot #{machine_ident} machine to the #{node[:machine][:driver]} environment" do
  machine_name machine_ident
  boot_options boot_options
  driver node[:machine][:driver]
  action node[:machine][:driver]
  only_if { node[:machine][:production_settings][machine_ident.to_sym].nil? }
end

# if driver is ssh then production flag is set to true
production_flag = node[:machine][:driver] == "ssh"

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
    production_flag: production_flag,
    oracle_wrapper: {
      dbs: ["jbpmdb"],
      archive_log_mode: production_flag
    },
    beats: {
      logging: node[:machine][:logging]
    },
    ehmp_oracle: {
      oracle_cookbook: oracle_cookbook,
      oracle_sid: oracle_sid
    },
    oracle_sql_config_artifacts: {
      source: oracle_sql_config_artifacts_source
    },
  )
  files lazy { node[:rdk_provision][:oracle][:copy_files] }
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
