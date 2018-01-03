#
# Cookbook Name:: ehmp_provision
# Recipe:: vista-kodak
#

require 'chef/provisioning/ssh_driver'

############################################## Staging Artifacts #############################################
if ENV.has_key?('HMP_LOCAL_FILE')
  node.default[:ehmp_provision][:'vista-kodak'][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['HMP_LOCAL_FILE'])}" => ENV['HMP_LOCAL_FILE']
  })
  hmp_source = "file:///tmp/#{File.basename(ENV['HMP_LOCAL_FILE'])}"
else
  hmp_source = artifact_url(node[:ehmp_provision][:artifacts][:kodak_hmp])
end

if ENV.has_key?('CACHE_LOCAL_FILE')
  node.default[:ehmp_provision][:'vista-kodak'][:copy_files].merge!({
    "/tmp/vista.zip" => "#{ENV['WORKSPACE']}/cache/vista/vista.zip"
  })
  cache_source = "file:///tmp/vista.zip"
else
  cache_version = ENV["KODAK_CACHE_VERSION"] || ENV["CACHE_VERSION"]
  cache_source = artifact_url(node[:ehmp_provision][:artifacts][:kodak_cache])
end

if ENV.has_key?('CORRELATED_IDS_LOCAL_FILE')
  node.default[:ehmp_provision][:'vista-kodak'][:copy_files].merge!({
    "/tmp/#{File.basename(ENV['CORRELATED_IDS_LOCAL_FILE'])}" => ENV['CORRELATED_IDS_LOCAL_FILE']
  })
  correlated_ids_source = "file:///tmp/#{File.basename(ENV['CORRELATED_IDS_LOCAL_FILE'])}"
else
  correlated_ids_source = artifact_url(node[:ehmp_provision][:artifacts][:correlated_ids])
end
############################################## Staging Artifacts #############################################

machine_ident = "vista-kodak"

boot_options = node[:ehmp_provision][machine_ident.to_sym]["#{node[:machine][:driver]}".to_sym]
node.default[:ehmp_provision][:'vista-kodak'][:copy_files].merge!(node[:machine][:copy_files])

machine_deps = parse_dependency_versions "machine"
ehmp_deps = parse_dependency_versions "ehmp_provision"

r_list = []
r_list << "recipe[packages::enable_internal_sources@#{machine_deps["packages"]}]"
r_list << "recipe[packages::disable_external_sources@#{machine_deps["packages"]}]" unless node[:simulated_ssh_driver].nil? && (node[:machine][:allow_web_access] || node[:machine][:driver] == "ssh")
r_list << (node[:simulated_ssh_driver] ? "recipe[role_cookbook::aws@#{machine_deps["role_cookbook"]}]" : "recipe[role_cookbook::#{node[:machine][:driver]}@#{machine_deps["role_cookbook"]}]")
r_list << "role[vista-kodak]"
r_list << "recipe[vista@#{ehmp_deps["vista"]}]"
r_list << "recipe[packages::upload@#{machine_deps["packages"]}]" if node[:machine][:cache_upload]
r_list << "recipe[packages::remove_localrepo@#{machine_deps["packages"]}]" if node[:machine][:driver] == "ssh" && node[:simulated_ssh_driver].nil?

machine_boot "boot #{machine_ident} machine to the #{node[:machine][:driver]} environment" do
  elastic_ip ENV["KODAK_ELASTIC_IP"]
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
    {
      stack: node[:machine][:stack],
      nexus_url: node[:common][:nexus_url],
      data_bag_string: node[:common][:data_bag_string],
      vista: {
        no_reset: ENV['NO_RESET'] || false,
        run_checksums: ENV.has_key?('RUN_CHECKSUMS'),
        cache: {
          source: cache_source
        },
        hmp_source: hmp_source,
        panorama: {
          correlated_ids: {
            source: correlated_ids_source
          }
        },
        domain_name: "KODAK.VISTACORE.US",
        site_recipe: "panorama",
        import_recipe: "kodak",
        site_id: "C877",
        site: "KODAK",
        abbreviation: "KDK",
        access_code: "ep1234",
        verify_code: "ep1234!!",
        multidivision_proxy_access_code: "EP1234",
        multidivision_proxy_verify_code: "EP1234!!",
        division: [{id: "507", name: "KODAK"},{id: "613", name: "MARTINSBURG"}, {id: "688", name: "WASHINGTON"}],
        station_number: "507",
        region: "us-east",
        clinics_osync_appointment_request: [
          {
            locationIen: "195",
            locationName: "CARDIOLOGY",
            hour: 11,
            minutes: 37
          }, {
            locationIen: "123",
            locationName: "PSYCHIATRY",
            hour: 11,
            minutes: 38
          }
        ],
        install_cache: ENV.has_key?("INSTALL_INTERSYSTEMS_CACHE") ? true : false,
        multiple_mode: false,
        poller_process_count: 1
      },
      beats: {
        logging: node[:machine][:logging]
      },
      yum_wrapper: {
        vistacore: {
          reponame: node[:machine][:staging]
        }
      }
    }
  )
  files lazy { node[:ehmp_provision][:'vista-kodak'][:copy_files] }
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
