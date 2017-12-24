#
# Cookbook Name:: jds
# Recipe:: configure_ecp_settings
#

user_password = Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"]

# This resource uses the Cache API to modify the configuration that is persisted in a cache.cpf file.
# See cache.cpf reference at http://docs.intersystems.com/latest/csp/docbook/DocBook.UI.Page.cls?KEY=RCPF
# and Config.config reference at https://docs.intersystems.com/latest/csp/documatic/%25CSP.Documatic.cls?PAGE=CLASS&LIBRARY=%25SYS&CLASSNAME=Config.config
jds_mumps_block "configure ecp settings" do
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  namespace "%SYS"
  command [
    "Set P(\"MaxServers\")=#{node[:jds][:ecp][:max_servers]}",           # maximum number of ECP servers that can be accessed from this system
    "Set P(\"MaxServerConn\")=#{node[:jds][:ecp][:max_servers_conn]}",   # maximum number of ECP clients that can access this system simultaneously
    "Set P(\"globals8kb\")=#{node[:jds][:ecp][:globals8kb]}",            # (MB) Number of 8KB global buffers.
    "Set P(\"gmheap\")=#{node[:jds][:ecp][:gmheap]}",                    # (KB) Size of generic memory heap for Caché, used by Lock table, the NLS tables, and the PID table
    "Set P(\"locksiz\")=#{node[:jds][:ecp][:locksiz]}",                  # (Bytes) Memory allocated to lock table. Cannot exceed gmheap. Rounded to 64KB boundaries.
    "Set P(\"routines\")=#{node[:jds][:ecp][:routines]}",                # (MB) Shared memory for caching routines.
    "Set Status=##class(Config.config).Modify(.P)",
    "Set Status=##class(Config.config).Get(.P)",
    "ZW P"
  ]
  log node[:jds][:chef_log]
  notifies :restart, "service[#{node[:jds][:service_name]}]", :immediately
end
