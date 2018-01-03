#
# Cookbook Name:: jbpm
# Recipe:: oracle_config
#

oracle_connector_home = "#{node['jboss-eap']['install_path']}/#{node['jboss-eap']['symlink']}/modules/system/layers/base/com/oracle/ojdbc6/main"
jbpm_username = data_bag_item("credentials", "oracle_user_jbpm", node[:data_bag_string])["username"]
jbpm_password = data_bag_item("credentials", "oracle_user_jbpm", node[:data_bag_string])["password"]
activitydb_username = data_bag_item("credentials", "oracle_user_activitydb", node[:data_bag_string])["username"]
activitydb_password = data_bag_item("credentials", "oracle_user_activitydb", node[:data_bag_string])["password"]

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
    :jbpm_username => jbpm_username,
    :jbpm_password => jbpm_password,
    :activitydb_username => activitydb_username,
    :activitydb_password => activitydb_password,
    :oracle_ip => oracle_node[:ipaddress],
    :oracle_sid => oracle_node[:ehmp_oracle][:oracle_sid],
    :oracle_port => oracle_node[:ehmp_oracle][:oracle_config][:port],
    :background_validation_millis => node[:jbpm][:oracle_config][:background_validation_millis]
  )
  notifies :run, "execute[Set jta flag to true in standalone.xml]", :immediately
  notifies :run, "execute[Remove previous jbpm datasource configuration]", :immediately
  notifies :run, "execute[Remove previous activitydb datasource configuration]", :immediately
  notifies :run, "execute[Add oracle datasource to standalone.xml]", :immediately
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

execute "Remove previous jbpm datasource configuration" do
  cwd "#{node[:jbpm][:workdir]}"
  command "sed -i '/#{node[:jbpm][:configure][:datasource]}/,/<\\/datasource>/ d' #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :before
  only_if "grep #{node[:jbpm][:configure][:datasource]} #{node[:jbpm][:home]}/configuration/standalone.xml"
  action :nothing
end

execute "Remove previous activitydb datasource configuration" do
  cwd "#{node[:jbpm][:workdir]}"
  command "sed -i '/#{node[:jbpm][:configure][:activitydb_datasource]}/,/<\\/datasource>/ d' #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :before
  only_if "grep #{node[:jbpm][:configure][:activitydb_datasource]} #{node[:jbpm][:home]}/configuration/standalone.xml"
  action :nothing
end

execute "Add oracle datasource to standalone.xml" do
  cwd "#{node[:jbpm][:workdir]}"
  command "sed -i '/<datasources>/r jbpm_oracle_datasource.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :before
  not_if "grep #{node[:jbpm][:configure][:datasource]} #{node[:jbpm][:home]}/configuration/standalone.xml"
  action :nothing
end

# This is for updating jta flag in existing jbpm deployments
execute "Set jta flag to true in standalone.xml" do
  command "sed -i 's/jta=\"false\"/jta=\"true\"/' #{node[:jbpm][:home]}/configuration/standalone.xml"
  action :nothing
end

valparams = "\\
                        <background-validation-millis>#{node[:jbpm][:oracle_config][:background_validation_millis]}</background-validation-millis>\\
                        <valid-connection-checker class-name=\"org.jboss.jca.adapters.jdbc.extensions.oracle.OracleValidConnectionChecker\"/>"


# This adds connection validation settings if they don't exist
execute "Set background-validation parameters" do
  command "sed -i.orig '/<\\/background-validation>/a #{valparams}' #{node[:jbpm][:home]}/configuration/standalone.xml"
  not_if "grep OracleValidConnectionChecker #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :restart, "service[jboss]", :delayed
end


# This updates the background-validation-millis if they have changed
execute "Set background-validation-millis parameters" do
  command "sed -i.orig 's/<background-validation-millis>.*/<background-validation-millis>#{node[:jbpm][:oracle_config][:background_validation_millis]}<\\/background-validation-millis>/g' #{node[:jbpm][:home]}/configuration/standalone.xml"
  not_if "grep '<background-validation-millis>#{node[:jbpm][:oracle_config][:background_validation_millis]}</background-validation-millis>' #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :restart, "service[jboss]", :delayed
end
