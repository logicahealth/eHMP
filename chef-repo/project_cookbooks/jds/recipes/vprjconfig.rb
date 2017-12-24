#
# Cookbook Name:: jds
# Recipe:: data_store_config
#

user_password = Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"]

# Run JDS configuration setup.
# SETUP^VPRJCONFIG will initialize ^VPRCONFIG with default values, iff those
# values do not already exist. ^VPRCONFIG settings that are controlled by
# node attributes are created by direct sets (S) commands.
jds_mumps_block "Run JDS configuration" do
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  namespace node[:jds][:cache_namespace]
  command [
    "D SETUP^VPRJCONFIG",
    "S ^VPRCONFIG(\"vvmax\",\"decoder\")=#{node[:jds][:vvmax][:decoder]}",
    "S ^VPRCONFIG(\"vvmax\",\"encoder\")=#{node[:jds][:vvmax][:encoder]}",
    "S ^VPRCONFIG(\"sync\",\"status\",\"solr\")=#{node[:jds][:config][:trackSolrStorage] ? 1 : 0}"
  ]
  node[:jds][:config][:solrStorageExceptions].each do |domain|
    command.push("S ^VPRCONFIG(\"sync\",\"status\",\"solr\",\"domainExceptions\",\"#{domain}\")=\"\"")
  end
  log node[:jds][:chef_log]
end
