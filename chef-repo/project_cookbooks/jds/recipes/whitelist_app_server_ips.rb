#
# Cookbook Name:: jds
# Recipe:: whitelist_app_server_ips
#

user_password = Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"]

app_servers = find_multiple_nodes_by_role("jds_app_server", node[:stack])
client_systems = ""
app_servers.each_with_index do |app_server, index|
  client_systems << "#{app_server[:ipaddress]}:%All"
  client_systems << ";" unless index == app_servers.size - 1
end

jds_mumps_block "whitelist app server ips" do
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  namespace "%SYS"
  command [
    "SET st=##class(Security.Services).Get(\"%Service_ECP\",.Properties)",
    "Set Properties(\"Enabled\")=1",
    "Set Properties(\"AutheEnabled\")=1024",
    "Set Properties(\"AutheEnabledCapabilities\")=1024",
    "Set Properties(\"Capabilities\")=921",
    "SET Properties(\"ClientSystems\")=\"#{client_systems}\"",
    "SET st=##class(Security.Services).Modify(\"%Service_ECP\",.Properties)",
    "SET st=##class(Security.Services).Get(\"%Service_ECP\",.Properties)",
    "ZW Properties"
  ]
  log node[:jds][:chef_log]
  notifies :restart, "service[#{node[:jds][:service_name]}]", :immediately
end
