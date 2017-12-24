#
# Cookbook Name:: rdk_provision
# Recipe:: jbpm
#

require 'chef/provisioning/ssh_driver'

include_oracle = find_optional_node_by_criteria(node[:machine][:stack], 'role:ehmp_oracle', 'role:jbpm').nil?

############################################## Staging Artifacts #############################################
if ENV.has_key?('DEV_DEPLOY')
  node.default[:rdk_provision][:jbpm][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['JBPM_PROJECTS_LOCAL_FILE_2'])}" => ENV['JBPM_PROJECTS_LOCAL_FILE_2'],
    "/tmp/#{File.basename(ENV['JBPM_PROJECTS_LOCAL_FILE_3'])}" => ENV['JBPM_PROJECTS_LOCAL_FILE_3'],
    "/tmp/#{File.basename(ENV['JBPM_PROJECTS_LOCAL_FILE_4'])}" => ENV['JBPM_PROJECTS_LOCAL_FILE_4'],
    "/tmp/#{File.basename(ENV['JBPM_PROJECTS_LOCAL_FILE_5'])}" => ENV['JBPM_PROJECTS_LOCAL_FILE_5'],
    "/tmp/#{File.basename(ENV['JBPM_AUTH_LOCAL_FILE'])}" => ENV['JBPM_AUTH_LOCAL_FILE'],
    "/tmp/#{File.basename(ENV['JBPM_EVENT_LISTENERS_LOCAL_FILE'])}" => ENV['JBPM_EVENT_LISTENERS_LOCAL_FILE'],
    "/tmp/#{File.basename(ENV['JBPM_CDSINVOCATIONSERVICE_LOCAL_FILE'])}" => ENV['JBPM_CDSINVOCATIONSERVICE_LOCAL_FILE'],
    "/tmp/#{File.basename(ENV['JBPM_FOBTLABSERVICE_LOCAL_FILE'])}" => ENV['JBPM_FOBTLABSERVICE_LOCAL_FILE'],
    "/tmp/#{File.basename(ENV['JBPM_TASKSSERVICE_LOCAL_FILE'])}" => ENV['JBPM_TASKSSERVICE_LOCAL_FILE'],
    "/tmp/#{File.basename(ENV['JBPM_EHMPSERVICES_LOCAL_FILE'])}" => ENV['JBPM_EHMPSERVICES_LOCAL_FILE'],
    "/tmp/#{File.basename(ENV['JBPM_UTILS_LOCAL_FILE'])}" => ENV['JBPM_UTILS_LOCAL_FILE']
  })
  jbpm_fit_artifacts_source = "file:///tmp/#{File.basename(ENV['JBPM_PROJECTS_LOCAL_FILE_2'])}"
  jbpm_fit_artifacts_version = "0.0.0"
  jbpm_general_medicine_artifacts_source = "file:///tmp/#{File.basename(ENV['JBPM_PROJECTS_LOCAL_FILE_3'])}"
  jbpm_general_medicine_artifacts_version = "0.0.0"
  jbpm_order_artifacts_source = "file:///tmp/#{File.basename(ENV['JBPM_PROJECTS_LOCAL_FILE_4'])}"
  jbpm_order_artifacts_version = "0.0.0"
  jbpm_auth_artifacts_source = "file:///tmp/#{File.basename(ENV['JBPM_AUTH_LOCAL_FILE'])}"
  jbpm_auth_artifacts_version = "0.0.0"
  jbpm_eventlisteners_artifacts_source = "file:///tmp/#{File.basename(ENV['JBPM_EVENT_LISTENERS_LOCAL_FILE'])}"
  jbpm_eventlisteners_artifacts_version = "0.0.0"
  jbpm_cdsinvocationservice_artifacts_source = "file:///tmp/#{File.basename(ENV['JBPM_CDSINVOCATIONSERVICE_LOCAL_FILE'])}"
  jbpm_cdsinvocationservice_artifacts_version = "0.0.0"
  jbpm_fobtlabservice_artifacts_source = "file:///tmp/#{File.basename(ENV['JBPM_FOBTLABSERVICE_LOCAL_FILE'])}"
  jbpm_fobtlabservice_artifacts_version = "0.0.0"
  jbpm_tasksservice_artifacts_source = "file:///tmp/#{File.basename(ENV['JBPM_TASKSSERVICE_LOCAL_FILE'])}"
  jbpm_tasksservice_artifacts_version = "0.0.0"
  jbpm_activity_artifacts_source = "file:///tmp/#{File.basename(ENV['JBPM_PROJECTS_LOCAL_FILE_5'])}"
  jbpm_activity_artifacts_version = "0.0.0"
  jbpm_ehmpservices_artifacts_source = "file:///tmp/#{File.basename(ENV['JBPM_EHMPSERVICES_LOCAL_FILE'])}"
  jbpm_ehmpservices_artifacts_version = "0.0.0"
  jbpm_utils_artifacts_source = "file:///tmp/#{File.basename(ENV['JBPM_UTILS_LOCAL_FILE'])}"
  jbpm_utils_artifacts_version = "0.0.0"
  if include_oracle
    node.default[:rdk_provision][:jbpm][:copy_files].merge!({
      "/tmp/#{File.basename(ENV['ORACLE_SQL_CONFIG_LOCAL_FILE'])}" => ENV['ORACLE_SQL_CONFIG_LOCAL_FILE']
    })
    oracle_sql_config_artifacts_source = "file:///tmp/#{File.basename(ENV['ORACLE_SQL_CONFIG_LOCAL_FILE'])}"
  end
else
  jbpm_fit_artifacts_source = artifact_url(node[:rdk_provision][:artifacts][:jbpm_fitlabproject])
  jbpm_fit_artifacts_version = node[:rdk_provision][:artifacts][:jbpm_fitlabproject][:version]
  jbpm_general_medicine_artifacts_source = artifact_url(node[:rdk_provision][:artifacts][:jbpm_general_medicine])
  jbpm_general_medicine_artifacts_version = node[:rdk_provision][:artifacts][:jbpm_general_medicine][:version]
  jbpm_order_artifacts_source = artifact_url(node[:rdk_provision][:artifacts][:jbpm_order])
  jbpm_order_artifacts_version = node[:rdk_provision][:artifacts][:jbpm_order][:version]
  jbpm_auth_artifacts_source = artifact_url(node[:rdk_provision][:artifacts][:jbpm_auth])
  jbpm_auth_artifacts_version = node[:rdk_provision][:artifacts][:jbpm_auth][:version]
  jbpm_eventlisteners_artifacts_source = artifact_url(node[:rdk_provision][:artifacts][:jbpm_eventlisteners])
  jbpm_eventlisteners_artifacts_version = node[:rdk_provision][:artifacts][:jbpm_eventlisteners][:version]
  jbpm_cdsinvocationservice_artifacts_source = artifact_url(node[:rdk_provision][:artifacts][:jbpm_cdsinvocationservice])
  jbpm_cdsinvocationservice_artifacts_version = node[:rdk_provision][:artifacts][:jbpm_cdsinvocationservice][:version]
  jbpm_fobtlabservice_artifacts_source = artifact_url(node[:rdk_provision][:artifacts][:jbpm_fobtlabservice])
  jbpm_fobtlabservice_artifacts_version = node[:rdk_provision][:artifacts][:jbpm_fobtlabservice][:version]
  jbpm_tasksservice_artifacts_source = artifact_url(node[:rdk_provision][:artifacts][:jbpm_tasksservice])
  jbpm_tasksservice_artifacts_version = node[:rdk_provision][:artifacts][:jbpm_tasksservice][:version]
  jbpm_activity_artifacts_source = artifact_url(node[:rdk_provision][:artifacts][:jbpm_activity])
  jbpm_activity_artifacts_version = node[:rdk_provision][:artifacts][:jbpm_activity][:version]
  jbpm_ehmpservices_artifacts_source = artifact_url(node[:rdk_provision][:artifacts][:jbpm_ehmpservices])
  jbpm_ehmpservices_artifacts_version = node[:rdk_provision][:artifacts][:jbpm_ehmpservices][:version]
  jbpm_utils_artifacts_source = artifact_url(node[:rdk_provision][:artifacts][:jbpm_utils])
  jbpm_utils_artifacts_version = node[:rdk_provision][:artifacts][:jbpm_utils][:version]
  if include_oracle
    oracle_sql_config_artifacts_source = artifact_url(node[:rdk_provision][:artifacts][:oracle_sql_config])
  end
end
############################################## Staging Artifacts #############################################

node.default[:machine][:block_device_mappings] = [{
  device_name: '/dev/sda1',
  ebs: {
    volume_size: 50 # 50 GB
  }
}] if include_oracle

machine_ident = "jbpm"

boot_options = node[:rdk_provision][machine_ident.to_sym]["#{node[:machine][:driver]}".to_sym]
node.default[:rdk_provision][:jbpm][:copy_files].merge!(node[:machine][:copy_files])
node.default[:machine][:box_name] = "centos-6.5-oracle-12c"
node.default[:machine][:box_url] = "#{node[:common][:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/opscode/centos/6.5-oracle-12c/centos-6.5-oracle-12c.box"

machine_deps = parse_dependency_versions "machine"
rdk_deps = parse_dependency_versions "rdk_provision"

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:simulated_ssh_driver].nil? && (node[:machine][:allow_web_access] || node[:machine][:driver] == "ssh")
r_list << (node[:simulated_ssh_driver] ? "recipe[role_cookbook::aws@#{machine_deps["role_cookbook"]}]" : "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]")
r_list << "role[jbpm]"
r_list << "recipe[ehmp_oracle::update_hostname@#{rdk_deps["ehmp_oracle"]}]" if node[:machine][:driver] == 'vagrant'
if include_oracle
  oracle_cookbook = "oracle_wrapper"
  oracle_sid = "JBPMDB"
  r_list << "role[ehmp_oracle]"
  r_list << "recipe[ehmp_oracle@#{rdk_deps["ehmp_oracle"]}]" unless ENV.has_key?('CLEAR_JBPM_DATA')
  r_list << "recipe[ehmp_oracle::env_vars@#{rdk_deps["ehmp_oracle"]}]" if ENV.has_key?('CLEAR_JBPM_DATA')
  r_list << "recipe[ehmp_oracle::oracle_test_data@#{rdk_deps["ehmp_oracle"]}]" unless node[:machine][:driver] == "ssh" || ENV.has_key?('CLEAR_JBPM_DATA')
else
  r_list << "recipe[ehmp_oracle::client@#{rdk_deps["ehmp_oracle"]}]"
end
if ENV.has_key?('CLEAR_JBPM_DATA')
  r_list << "recipe[jbpm::clear_jbpm_data@#{rdk_deps["jbpm"]}]"
else
  r_list << "recipe[jbpm@#{rdk_deps["jbpm"]}]"
end
r_list << "recipe[packages::upload@#{machine_deps["packages"]}]" if node[:machine][:cache_upload]
r_list << "recipe[packages::remove_localrepo@#{machine_deps["packages"]}]" if node[:machine][:driver] == "ssh" && node[:simulated_ssh_driver].nil?

machine_boot "boot #{machine_ident} machine to the #{node[:machine][:driver]} environment" do
  machine_name machine_ident
  boot_options boot_options
  driver node[:machine][:driver]
  action node[:machine][:driver]
  only_if { node[:machine][:production_settings][machine_ident.to_sym].nil? }
end

# if driver is ssh then production flag is set to true
production_flag = node[:machine][:driver] == "ssh" && node[:simulated_ssh_driver].nil?

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
    stack: node[:machine][:stack],
    nexus_url: node[:common][:nexus_url],
    data_bag_string: node[:common][:data_bag_string],
    production_flag: production_flag,
    jbpm_fit_artifacts: {
      source: jbpm_fit_artifacts_source,
      version: jbpm_fit_artifacts_version
    },
    jbpm_general_medicine_artifacts: {
      source: jbpm_general_medicine_artifacts_source,
      version: jbpm_general_medicine_artifacts_version
    },
    jbpm_order_artifacts: {
      source: jbpm_order_artifacts_source,
      version: jbpm_order_artifacts_version
    },
    jbpm_auth_artifacts: {
      source: jbpm_auth_artifacts_source,
      version: jbpm_auth_artifacts_version
    },
    jbpm_eventlisteners_artifacts: {
      source: jbpm_eventlisteners_artifacts_source,
      version: jbpm_eventlisteners_artifacts_version
    },
    jbpm_cdsinvocationservice_artifacts: {
      source: jbpm_cdsinvocationservice_artifacts_source,
      version: jbpm_cdsinvocationservice_artifacts_version
    },
    jbpm_fobtlabservice_artifacts: {
      source: jbpm_fobtlabservice_artifacts_source,
      version: jbpm_fobtlabservice_artifacts_version
    },
    jbpm_tasksservice_artifacts: {
      source: jbpm_tasksservice_artifacts_source,
      version: jbpm_tasksservice_artifacts_version
    },
    jbpm_activity_artifacts: {
      source: jbpm_activity_artifacts_source,
      version: jbpm_activity_artifacts_version
    },
    jbpm_ehmpservices_artifacts: {
      source: jbpm_ehmpservices_artifacts_source,
      version: jbpm_ehmpservices_artifacts_version
    },
    jbpm_utils_artifacts: {
      source: jbpm_utils_artifacts_source,
      version: jbpm_utils_artifacts_version
    },
    oracle_wrapper: {
      dbs: ["jbpmdb"],
      archive_log_mode: production_flag
    },
    beats: {
      logging: node[:machine][:logging]
    },
    ehmp_oracle: {
      oracle_cookbook: oracle_cookbook,
      oracle_sid: oracle_sid,
      swap: {
        include_swap: node[:machine][:driver] != "ssh"
      }
    },
    oracle_sql_config_artifacts: {
      source: oracle_sql_config_artifacts_source
    },
    jbpm: {
      allow_clear_data: node[:machine][:driver] != "ssh"
    },
    yum_wrapper: {
      vistacore: {
        reponame: node[:machine][:staging]
      }
    },
    vbox_ip: node['rdk_provision']['jbpm']['vagrant']['ip_address']
  )
  files lazy { node[:rdk_provision][:jbpm][:copy_files] }
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
