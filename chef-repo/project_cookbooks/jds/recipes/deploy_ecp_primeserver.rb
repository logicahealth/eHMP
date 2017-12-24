#
# Cookbook Name:: jds
# Recipe:: deploy_ecp_primeserver
#

user_password = Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"]

data_servers = find_multiple_nodes_by_role("jds_data_server", node[:stack])
data_servers_string = ""
data_servers.each_with_index do |data_server, index|
  data_servers_string << "#{data_server[:ipaddress]}"
  data_servers_string << ":#{data_server[:jds][:ecp][:default_port]}"
  data_servers_string << ";" unless index == data_servers.size - 1
end

template "eHMP.PrimeAutomation.xml" do
  path "/tmp/eHMP.PrimeAutomation.xml"
  variables(
    :data_servers_string => data_servers_string,
    :expansion_size => node[:jds][:ecp][:expansion_size]
  )
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  mode "0755"
  action :create
end

jds_mumps_block "deploy prime" do
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  namespace "%SYS"
  command [
    "D $System.OBJ.Load(\"/tmp/eHMP.PrimeAutomation.xml\",\"c\")",
    "D ##class(eHMP.PrimeAutomation).Run()"
  ]
  log node[:jds][:chef_log]
  notifies :restart, "service[#{node[:jds][:service_name]}]", :immediately
end
