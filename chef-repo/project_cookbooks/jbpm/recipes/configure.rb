
# Cookbook Name:: jbpm
# Recipe::configure_deploy
#

rdknodes = find_multiple_nodes_by_role("resource_server", node[:stack])
cdsinvocation = find_optional_node_by_role("cdsinvocation", node[:stack])
admin_password = Chef::EncryptedDataBagItem.load("credentials", "jbpm_admin_password", node[:data_bag_string])["password"]

jbpm_check_war_deployment "business-central"

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/jboss-web.xml" do
  mode "0644"
  owner "jboss"
  group "jboss"
  variables(:contextroot => "business-central")
  notifies :restart, "service[jboss]"
end

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/lib/rdkconfig.properties" do
  mode "0644"
  owner "jboss"
  group "jboss"
  variables(:rdknodes => rdknodes)
  notifies :restart, "service[jboss]"
end

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/lib/cdsconfig.properties" do
  mode "0644"
  owner "jboss"
  group "jboss"
  variables(:cdsinvocation => cdsinvocation)
  notifies :restart, "service[jboss]"
end

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/lib/rdkwritebackconfig.properties" do
  mode "0644"
  owner "jboss"
  group "jboss"
  variables(:rdknodes => rdknodes)
  notifies :restart, "service[jboss]"
end

jbpm_check_war_deployment "dashbuilder"

template "#{node[:jbpm][:home]}/deployments/dashbuilder.war/WEB-INF/jboss-web.xml" do
  mode "0644"
  owner "jboss"
  group "jboss"
  variables(:contextroot => "dashbuilder")
  notifies :restart, "service[jboss]"
end

template "#{node[:jbpm][:home]}/deployments/dashbuilder.war/WEB-INF/jboss-deployment-structure.xml" do
  mode "0644"
  owner "jboss"
  group "jboss"
  notifies :restart, "service[jboss]"
end

template "#{Chef::Config[:file_cache_path]}/set_authentication_settings.xml" do
  mode "0755"
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

# suppress warnings because they are shown every second and fill up the log file
cookbook_file "#{Chef::Config['file_cache_path']}/suppress_jbpm_warnings.xml"
execute "Limit jbpm log warning messages in standalone.xml" do
  command "sed -i '/periodic-rotating-file-handler>/r suppress_jbpm_warnings.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  cwd "#{Chef::Config[:file_cache_path]}"
  not_if "grep org.hibernate.loader #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :immediately
end

cookbook_file "#{Chef::Config['file_cache_path']}/system_properties.xml"
execute "Disable demo repository in standalone.xml" do
  command "sed -i '/<system-properties>/r system_properties.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  cwd "#{Chef::Config[:file_cache_path]}"
  not_if "grep 'property name=\"org.kie.demo\" value=\"false\"' #{node[:jbpm][:home]}/configuration/standalone.xml"
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

remote_file "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/lib/EhmpServices.jar" do
   owner 'jboss'
   mode   '0755'
   source node[:jbpm_ehmpservices_artifacts][:source]
   use_conditional_get true
   notifies :restart, "service[jboss]"
end

remote_file "#{node[:jbpm][:home]}/deployments/tasksservice.war" do
   owner 'jboss'
   mode   '0755'
   source node[:jbpm_tasksservice_artifacts][:source]
   use_conditional_get true
end

jbpm_check_war_deployment "business-central"

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/classes/META-INF/persistence.xml" do
  variables(:dialect => "Oracle10gDialect",
            :base_route_entity => node[:jbpm][:configure][:base_route_entity],
            :task_instance_entity => node[:jbpm][:configure][:task_instance_entity],
            :process_instance_entity => node[:jbpm][:configure][:process_instance_entity],
            :task_route_entity => node[:jbpm][:configure][:task_route_entity],
            :process_route_entity => node[:jbpm][:configure][:process_route_entity],
            :event_listener_entity => node[:jbpm][:configure][:event_listener_entity],
            :event_match_action_entity => node[:jbpm][:configure][:event_match_action_entity],
            :event_match_criteria_entity => node[:jbpm][:configure][:event_match_criteria_entity],
            :simple_match_entity => node[:jbpm][:configure][:simple_match_entity],
            :signal_instance_entity => node[:jbpm][:configure][:signal_instance_entity],
            :processed_event_state_entity => node[:jbpm][:configure][:processed_event_state_entity]

    )
  notifies :stop, "service[jboss]", :immediately
end

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/classes/META-INF/kie-wb-deployment-descriptor.xml" do
  notifies :restart, "service[jboss]", :immediately
end

jbpm_check_war_deployment "business-central"

jbpm_deploy_jar "deploy_fit_lab_jar" do
  password admin_password
  group_id node[:jbpm][:organization]
  artifact_id "FITLabProject"
  version node[:jbpm_fit_artifacts][:version]
  jar_source node[:jbpm_fit_artifacts][:source]
  undeploy_legacy_jars node[:jbpm][:configure][:undeploy_legacy_jars]
  owner 'jboss'
  group 'jboss'
  mode  '0755'
end

jbpm_deploy_jar "deploy_general_medicine_jar" do
  password admin_password
  group_id node[:jbpm][:organization]
  artifact_id "General_Medicine"
  version node[:jbpm_general_medicine_artifacts][:version]
  jar_source node[:jbpm_general_medicine_artifacts][:source]
  undeploy_legacy_jars node[:jbpm][:configure][:undeploy_legacy_jars]
  owner 'jboss'
  group 'jboss'
  mode  '0755'
end

jbpm_deploy_jar "deploy_order_jar" do
  password admin_password
  group_id node[:jbpm][:organization]
  artifact_id "Order"
  version node[:jbpm_order_artifacts][:version]
  jar_source node[:jbpm_order_artifacts][:source]
  undeploy_legacy_jars node[:jbpm][:configure][:undeploy_legacy_jars]
  owner 'jboss'
  group 'jboss'
  mode  '0755'
end

jbpm_deploy_jar "deploy_activity_jar" do
  password admin_password
  group_id node[:jbpm][:organization]
  artifact_id "Activity"
  version node[:jbpm_activity_artifacts][:version]
  jar_source node[:jbpm_activity_artifacts][:source]
  undeploy_legacy_jars node[:jbpm][:configure][:undeploy_legacy_jars]
  owner 'jboss'
  group 'jboss'
  mode  '0755'
end

jbpm_clean_up_jars "delete_undeployed_jars" do
  user node[:jbpm][:install][:admin_user]
  password admin_password
  only_if { node[:jbpm][:configure][:delete_legacy_jars] }
end
