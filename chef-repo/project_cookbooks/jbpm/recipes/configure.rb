
# Cookbook Name:: jbpm
# Recipe::configure_deploy
#

rdknode = find_node_by_role("resource_server", node[:stack])
cdsinvocation = find_optional_node_by_role("cdsinvocation", node[:stack])
admin_password = Chef::EncryptedDataBagItem.load("credentials", "jbpm_admin_password", 'n25q2mp#h4')["password"]

jbpm_check_war_deployment "business-central"

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/jboss-web.xml" do
  variables(:contextroot => "business-central")
  notifies :restart, "service[jboss]"
end

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/lib/rdkconfig.properties" do
  variables(:rdknode => rdknode)
  notifies :restart, "service[jboss]"
end

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/lib/cdsconfig.properties" do
  variables(:cdsinvocation => cdsinvocation)
  notifies :restart, "service[jboss]"
end

jbpm_check_war_deployment "dashbuilder"

template "#{node[:jbpm][:home]}/deployments/dashbuilder.war/WEB-INF/jboss-web.xml" do
  variables(:contextroot => "dashbuilder")
  notifies :restart, "service[jboss]"
end

template "#{node[:jbpm][:home]}/deployments/dashbuilder.war/WEB-INF/jboss-deployment-structure.xml" do
  notifies :restart, "service[jboss]"
end

template "#{Chef::Config[:file_cache_path]}/set_authentication_settings.xml" do
  mode "0755"
  variables(:rdknode => rdknode)
end

template "#{node[:jbpm][:m2_home]}/settings.xml" do
  mode "0755"
  owner "jboss"
  group "jboss"
  notifies :stop, "service[jboss]", :immediately
end

# Using sed to insert lines in the configuration file, since the file is modified by the jbpm installation and therefore can't be a template
execute "Set configuration for authentication in standalone.xml" do
  command "sed -i '/<security-domains>/r set_authentication_settings.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  cwd "#{Chef::Config[:file_cache_path]}"
  not_if "grep #{node[:jbpm][:configure][:security_domain]} #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :immediately
end

cookbook_file "#{Chef::Config['file_cache_path']}/multiple_last_resources_config.xml"

# Using sed to insert lines in the configuration file, since the file is modified by the jbpm installation and therefore can't be a template
execute "Set configuration for multiple last resources in standalone.xml" do
  command "sed -i '/<system-properties>/r multiple_last_resources_config.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  cwd "#{Chef::Config[:file_cache_path]}"
  not_if "grep com.arjuna.ats.arjuna.allowMultipleLastResources #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :immediately
end

# suppress warnings because they are shown every second and fill up the log file
cookbook_file "#{Chef::Config['file_cache_path']}/suppress_jbpm_warnings.xml"
execute "Limit jbpm log warning messages in standalone.xml" do
  command "sed -i '/periodic-rotating-file-handler>/r suppress_jbpm_warnings.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  cwd "#{Chef::Config[:file_cache_path]}"
  not_if "grep org.hibernate.loader #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :immediately
end

#Deploy Authentication jar
remote_file "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/lib/jboss-custom-login-jar-with-dependencies.jar" do
   owner 'jboss'
   mode   '0755'
   source node[:jbpm_auth_artifacts][:source]
   use_conditional_get true
   notifies :restart, "service[jboss]"
end

#Deploy custom event listeners jar
remote_file "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/lib/jbpm-custom-event-listeners.jar" do
   owner 'jboss'
   mode   '0755'
   source node[:jbpm_eventlisteners_artifacts][:source]
   use_conditional_get true
   notifies :restart, "service[jboss]"
end

remote_file "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/lib/CDSInvocationService.jar" do
   owner 'jboss'
   mode   '0755'
   source node[:jbpm_cdsinvocationservice_artifacts][:source]
   use_conditional_get true
   notifies :restart, "service[jboss]"
end

remote_file "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/lib/FOBTLabService.jar" do
   owner 'jboss'
   mode   '0755'
   source node[:jbpm_fobtlabservice_artifacts][:source]
   use_conditional_get true
   notifies :restart, "service[jboss]"
end

remote_file "#{node[:jbpm][:home]}/deployments/tasksservice.war" do
   owner 'jboss'
   mode   '0755'
   source node[:jbpm_tasksservice_artifacts][:source]
   use_conditional_get true
end

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/classes/META-INF/kie-wb-deployment-descriptor.xml" do
  notifies :restart, "service[jboss]", :immediately
end

jbpm_check_war_deployment "business-central"

jbpm_deploy_jar "deploy_vista_tasks_jar" do
  password admin_password
  group_id node[:jbpm][:organization]
  artifact_id "VistaTasks"
  version node[:jbpm_artifacts][:version]
  jar_source node[:jbpm_artifacts][:source]
  owner 'jboss'
  group 'jboss'
  mode  '0755'
  not_if { jar_deployed?("VistaTasks", node[:jbpm_artifacts][:version], node[:jbpm][:install][:admin_user], admin_password) }
end

jbpm_deploy_jar "deploy_fit_lab_jar" do
  password admin_password
  group_id node[:jbpm][:organization]
  artifact_id "FITLabProject"
  version node[:jbpm_fit_artifacts][:version]
  jar_source node[:jbpm_fit_artifacts][:source]
  owner 'jboss'
  group 'jboss'
  mode  '0755'
  not_if { jar_deployed?("FITLabProject", node[:jbpm_fit_artifacts][:version], node[:jbpm][:install][:admin_user], admin_password) }
end

jbpm_deploy_jar "deploy_general_medicine_jar" do
  password admin_password
  group_id node[:jbpm][:organization]
  artifact_id "General_Medicine"
  version node[:jbpm_general_medicine_artifacts][:version]
  jar_source node[:jbpm_general_medicine_artifacts][:source]
  owner 'jboss'
  group 'jboss'
  mode  '0755'
  not_if { jar_deployed?("General_Medicine", node[:jbpm_general_medicine_artifacts][:version], node[:jbpm][:install][:admin_user], admin_password) }
end

jbpm_deploy_jar "deploy_order_jar" do
  password admin_password
  group_id node[:jbpm][:organization]
  artifact_id "Order"
  version node[:jbpm_order_artifacts][:version]
  jar_source node[:jbpm_order_artifacts][:source]
  owner 'jboss'
  group 'jboss'
  mode  '0755'
  not_if { jar_deployed?("Order", node[:jbpm_order_artifacts][:version], node[:jbpm][:install][:admin_user], admin_password) }
end

jbpm_deploy_jar "deploy_activity_jar" do
  password admin_password
  group_id node[:jbpm][:organization]
  artifact_id "Activity"
  version node[:jbpm_activity_artifacts][:version]
  jar_source node[:jbpm_activity_artifacts][:source]
  owner 'jboss'
  group 'jboss'
  mode  '0755'
  not_if { jar_deployed?("Activity", node[:jbpm_activity_artifacts][:version], node[:jbpm][:install][:admin_user], admin_password) }
end
