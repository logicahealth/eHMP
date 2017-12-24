#
# Cookbook Name:: jds
# Recipe:: deploy_ecp_dataserver
#

user_password = Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"]

template "eHMP.ShardAutomation.xml" do
  path "/tmp/eHMP.ShardAutomation.xml"
  variables(
    :db_size => node[:jds][:ecp][:db_size],
    :expansion_size => node[:jds][:ecp][:expansion_size]
  )
  owner node[:jds][:cache_user]
  group node[:jds][:cache_user]
  mode "0755"
  action :create
end

jds_mumps_block "deploy shards" do
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  timeout 7200
  namespace "%SYS"
  command [
    "D $System.OBJ.Load(\"/tmp/eHMP.ShardAutomation.xml\",\"c\")",
    "D ##class(eHMP.ShardAutomation).Run(#{node[:jds][:ecp][:servers]},#{node[:jds][:ecp][:ordinality]},#{node[:jds][:ecp][:shards]},#{node[:jds][:ecp][:shards_per_server]})"
  ]
  log node[:jds][:chef_log]
  notifies :restart, "service[#{node[:jds][:service_name]}]", :immediately
end
