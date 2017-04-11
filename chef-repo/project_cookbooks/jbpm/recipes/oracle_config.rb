#
# Cookbook Name:: jbpm
# Recipe:: oracle-xe_config
#

oracle_connector_home = "#{node['jboss-eap']['install_path']}/#{node['jboss-eap']['symlink']}/modules/system/layers/base/com/oracle/ojdbc6/main"
datasource_password = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", 'n25q2mp#h4')["password"]
jbpm_schema_password = Chef::EncryptedDataBagItem.load("jbpm", "jbpm_schema_password", 'n25q2mp#h4')["password"]
activitydb_schema_password = Chef::EncryptedDataBagItem.load("jbpm", "activitydb_schema_password", 'n25q2mp#h4')["password"]

#Create jBPM schema
cookbook_file "#{Chef::Config[:file_cache_path]}/create_jbpm_schema.sql"

as_oracle = "sudo -Eu oracle PATH=$PATH"

execute "Create jbpm oracle schema" do
  command "#{as_oracle} echo exit | sqlplus sys/#{datasource_password} as sysdba@connect @#{Chef::Config[:file_cache_path]}/create_jbpm_schema.sql"
  # this command has a password in it - we don't want it to show up in logs
  sensitive true
end

#Create activitydb schema
cookbook_file "#{Chef::Config[:file_cache_path]}/create_jbpm_activitydb_schema.sql"

execute "Create activitydb oracle schema" do
  command "#{as_oracle} echo exit | sqlplus sys/#{datasource_password} as sysdba@connect @#{Chef::Config[:file_cache_path]}/create_jbpm_activitydb_schema.sql"
  sensitive true
end

#Create pcmm schema
cookbook_file "#{Chef::Config[:file_cache_path]}/create_jbpm_pcmm_schema.sql"

execute "Create pcmm oracle schemas" do
  command "#{as_oracle} echo exit | sqlplus sys/#{datasource_password} as sysdba@connect @#{Chef::Config[:file_cache_path]}/create_jbpm_pcmm_schema.sql"
  sensitive true
end

#Create pcmm schema
cookbook_file "#{Chef::Config[:file_cache_path]}/create_jbpm_all_schemas.sql"

execute "Create remaining oracle schemas" do
  command "#{as_oracle} echo exit | sqlplus sys/#{datasource_password} as sysdba@connect @#{Chef::Config[:file_cache_path]}/create_jbpm_all_schemas.sql"
  sensitive true
end

# Install oracle connector in jboss
directory "#{oracle_connector_home}" do
  user node['jboss-eap'][:jboss_user]
  recursive true
  action :create
end

remote_file "#{oracle_connector_home}/ojdbc6.jar" do
  source node[:jbpm][:oracle_config][:connector_source]
  mode   "0755"
  use_conditional_get true
  notifies :stop, "service[jboss]", :immediately
  action :create_if_missing
end

cookbook_file "#{oracle_connector_home}/module.xml" do
  mode "0755"
  user node['jboss-eap'][:jboss_user]
  notifies :stop, "service[jboss]", :immediately
end

template "#{Chef::Config['file_cache_path']}/jbpm_oracle_datasource.xml" do
  variables(
    :jbpm_schema_password => jbpm_schema_password,
    :activitydb_schema_password => activitydb_schema_password
  )
end

template "#{Chef::Config['file_cache_path']}/jbpm_oracle_driver.xml" do
  notifies :stop, "service[jboss]", :immediately
end

# Using sed to insert lines in the configuration file, since the file is modified by the jbpm installation and therefore can't be a template
execute "Add oracle driver to standalone.xml" do
  command "sed -i '/<drivers>/r jbpm_oracle_driver.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  cwd "#{Chef::Config[:file_cache_path]}"
  not_if "grep oracle.jdbc.OracleDriver #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :immediately
end

execute "Add oracle datasource to standalone.xml" do
  command "sed -i '/<datasources>/r jbpm_oracle_datasource.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  cwd "#{Chef::Config[:file_cache_path]}"
  not_if "grep #{node[:jbpm][:configure][:datasource]} #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :immediately
end

jbpm_check_war_deployment "business-central"

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/classes/META-INF/persistence.xml" do
  variables(:dialect => "Oracle10gDialect")
  notifies :stop, "service[jboss]", :immediately
end
