#
# Cookbook Name:: jbpm
# Recipe:: default
#

default[:jbpm][:home] = "#{node['jboss-eap']['install_path']}/#{node['jboss-eap']['symlink']}/standalone"
default[:jbpm][:gitdir] = '/home/jboss'
default[:jbpm][:oracle_jdbc] = 'com.oracle.ojdbc6'
default[:jbpm][:m2_home] = '/home/jboss/.m2'
default[:jbpm][:organization] = 'VistaCore'
default[:jbpm][:oracle_client_path] = '/usr/lib/oracle/12.1/client64/bin'
default[:jbpm][:ld_library_path] = '/usr/lib/oracle/12.1/client64/lib'
default[:jbpm][:log_level] = 'INFO'
default[:jbpm][:eap_version_file] = '/opt/jboss/version.txt'
default[:jbpm][:workdir] = '/tmp'

default[:jbpm][:server_port] = 8080
default[:jbpm][:nerve] = {
  check_interval: 30,
  checks: [
    {
      type: 'http',
      uri: '/business-central/kie-wb.html',
      timeout: 5,
      rise: 3,
      fall: 2
    }
  ]
}
