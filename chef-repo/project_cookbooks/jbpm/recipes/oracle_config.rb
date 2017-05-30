#
# Cookbook Name:: jbpm
# Recipe:: oracle-xe_config
#

oracle_connector_home = "#{node['jboss-eap']['install_path']}/#{node['jboss-eap']['symlink']}/modules/system/layers/base/com/oracle/ojdbc6/main"
jbpm_schema_password = Chef::EncryptedDataBagItem.load("jbpm", "sql_users_password", node[:data_bag_string])["jbpm_password"]
activitydb_schema_password = activitydb_password = Chef::EncryptedDataBagItem.load("jbpm", "sql_users_password", node[:data_bag_string])["activitydb_password"]
datasource_password = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", node[:data_bag_string])["password"]

# The following is only needed when upgrading jbpm6.1 to 6.3
as_oracle = "sudo -Eu oracle PATH=$PATH"
execute "Update jbpm oracle schema" do
  cwd node[:jbpm][:oracle_config][:sql_config_dir]
  command "#{as_oracle} echo exit | sqlplus sys/#{datasource_password} as sysdba@connect @update_jbpm_30_schema.sql"
  sensitive true
  only_if { node[:jbpm][:cur_jbpm_version].include? "62"}
end

# Install oracle connector in jboss
common_directory "#{oracle_connector_home}" do
  owner node['jboss-eap'][:jboss_user]
  group node['jboss-eap'][:jboss_user]
  mode "0755"
  recursive true
  action :create
end

remote_file "#{oracle_connector_home}/ojdbc6.jar" do
  source node[:jbpm][:oracle_config][:connector_source]
  mode   "0755"
  use_conditional_get true
  user node['jboss-eap'][:jboss_user]
  notifies :stop, "service[jboss]", :immediately
end

cookbook_file "#{oracle_connector_home}/module.xml" do
  mode "0755"
  user node['jboss-eap'][:jboss_user]
  notifies :stop, "service[jboss]", :immediately
end

oracle_node = find_node_by_role("ehmp_oracle", node[:stack])

template "#{node[:jbpm][:workdir]}/jbpm_oracle_datasource.xml" do
  variables(
    :jbpm_schema_password => jbpm_schema_password,
    :activitydb_schema_password => activitydb_schema_password,
    :oracle_ip => oracle_node[:ipaddress],
    :oracle_sid => oracle_node[:ehmp_oracle][:oracle_sid],
    :oracle_port => oracle_node[:ehmp_oracle][:oracle_config][:port]
  )
  notifies :run, "execute[Set jta flag to true in standalone.xml]", :immediately
  sensitive true
end

template "#{node[:jbpm][:workdir]}/jbpm_oracle_driver.xml" do
  notifies :stop, "service[jboss]", :immediately
end

# Using sed to insert lines in the configuration file, since the file is modified by the jbpm installation and therefore can't be a template
execute "Add oracle driver to standalone.xml" do
  cwd "#{node[:jbpm][:workdir]}"
  command "sed -i '/<drivers>/r jbpm_oracle_driver.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :immediately
  not_if "grep oracle.jdbc.OracleDriver #{node[:jbpm][:home]}/configuration/standalone.xml"
end

execute "Add oracle datasource to standalone.xml" do
  cwd "#{node[:jbpm][:workdir]}"
  command "sed -i '/<datasources>/r jbpm_oracle_datasource.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :immediately
  not_if "grep #{node[:jbpm][:configure][:datasource]} #{node[:jbpm][:home]}/configuration/standalone.xml"
end

# This is for updating jta flag in existing jbpm deployments
execute "Set jta flag to true in standalone.xml" do
  command "sed -i 's/jta=\"false\"/jta=\"true\"/' #{node[:jbpm][:home]}/configuration/standalone.xml"
  action :nothing
end
