#
# Cookbook Name:: jbpm
# Recipe:: oracle-xe_config
#

oracle_connector_home = "#{node['jboss-eap']['install_path']}/#{node['jboss-eap']['symlink']}/modules/system/layers/base/com/oracle/ojdbc6/main"
jbpm_schema_password = Chef::EncryptedDataBagItem.load("jbpm", "jbpm_schema_password", node[:data_bag_string])["password"]
activitydb_schema_password = Chef::EncryptedDataBagItem.load("jbpm", "activitydb_schema_password", node[:data_bag_string])["password"]

remote_file "#{Chef::Config.file_cache_path}/sql_config.tgz" do
  use_conditional_get true
  source node[:jbpm_sql_config_artifacts][:source]
  mode   "0755"
  notifies :delete, "directory[#{node[:jbpm][:oracle_config][:sql_config_dir]}]", :immediately
end

directory node[:jbpm][:oracle_config][:sql_config_dir] do
  owner  'root'
  group  'root'
  mode "0755"
  recursive true
  action :create
end

execute "extract_sql_config.tgz" do
  cwd node[:jbpm][:oracle_config][:sql_config_dir]
  command "tar -zxvf #{Chef::Config.file_cache_path}/sql_config.tgz"
  notifies :execute, "jbpm_sql_config[configure_sql]", :immediately
  only_if { (Dir.entries(node[:jbpm][:oracle_config][:sql_config_dir]) - %w{ . .. }).empty? }
end

jbpm_sql_config "configure_sql" do
  config_dir node[:jbpm][:oracle_config][:sql_config_dir]
  action :nothing
end

# Install oracle connector in jboss
common_directory "#{oracle_connector_home}" do
  owner node['jboss-eap'][:jboss_user]
  mode 755
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
  notifies :run, "execute[Set jta flag to true in standalone.xml]", :immediately
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

# This is for updating jta flag in existing jbpm deployments
execute "Set jta flag to true in standalone.xml" do
  command "sed -i 's/jta=\"false\"/jta=\"true\"/' #{node[:jbpm][:home]}/configuration/standalone.xml"
  action :nothing
end

