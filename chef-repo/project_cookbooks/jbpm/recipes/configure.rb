
# Cookbook Name:: jbpm
# Recipe::configure_deploy
#

include_recipe "ehmp_synapse"

admin_username = data_bag_item("credentials", "jbpm_admin_password", node[:data_bag_string])["username"]
admin_password = data_bag_item("credentials", "jbpm_admin_password", node[:data_bag_string])["password"]
jbpm_username = data_bag_item("credentials", "oracle_user_jbpm", node[:data_bag_string])["username"]
jbpm_password = data_bag_item("credentials", "oracle_user_jbpm", node[:data_bag_string])["password"]
oracle_node = find_optional_node_by_role("ehmp_oracle", node[:stack])
oracle_ip = oracle_node[:ipaddress] if !oracle_node.nil?
oracle_port = oracle_node[:ehmp_oracle][:oracle_config][:port] if !oracle_node.nil?
oracle_sid = oracle_node[:ehmp_oracle][:oracle_sid] if !oracle_node.nil?

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/jboss-web.xml" do
  mode "0644"
  owner "jboss"
  group "jboss"
  variables(:contextroot => "business-central")
  notifies :restart, "service[jboss]"
end

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/classes/rdkconfig.properties" do
  mode "0644"
  owner "jboss"
  group "jboss"
  variables(
    :fetch_server_host => "localhost",
    :fetch_server_port => node[:synapse][:services][:fetch_server][:haproxy][:port]
  )
  notifies :restart, "service[jboss]"
end

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/classes/cdsconfig.properties" do
  mode "0644"
  owner "jboss"
  group "jboss"
  variables(
    :cdsinvocation_port => node[:synapse][:services][:cdsinvocation][:haproxy][:port]
  )
  notifies :restart, "service[jboss]"
end

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/classes/rdkwritebackconfig.properties" do
  mode "0644"
  owner "jboss"
  group "jboss"
  variables(
    :write_back_host => "localhost",
    :write_back_port => node[:synapse][:services][:write_back][:haproxy][:port]
  )
  notifies :restart, "service[jboss]"
end

template "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/classes/dischargeconfig.properties" do
  mode "0644"
  owner "jboss"
  group "jboss"
  variables(:discharge_followup_timeout => node[:jbpm][:configure][:discharge_followup_timeout])
  notifies :restart, "service[jboss]"
end


file "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/lib/rdkconfig.properties" do
  action :delete
end

file "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/lib/rdkwritebackconfig.properties" do
  action :delete
end

file "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/lib/cdsconfig.properties" do
  action :delete
end

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

template "#{node[:jbpm][:workdir]}/set_authentication_settings.xml" do
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
  cwd "#{node[:jbpm][:workdir]}"
  command "sed -i '/<security-domains>/r set_authentication_settings.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :immediately
  not_if "grep #{node[:jbpm][:configure][:security_domain]} #{node[:jbpm][:home]}/configuration/standalone.xml"
end

# suppress warnings because they are shown every second and fill up the log file
cookbook_file "#{node[:jbpm][:workdir]}/suppress_jbpm_warnings.xml"
execute "Limit jbpm log warning messages in standalone.xml" do
  cwd "#{node[:jbpm][:workdir]}"
  command "sed -i '/periodic-rotating-file-handler>/r suppress_jbpm_warnings.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :immediately
  not_if "grep org.hibernate.loader #{node[:jbpm][:home]}/configuration/standalone.xml"
end

cookbook_file "#{node[:jbpm][:workdir]}/system_properties.xml"

execute "Disable demo repository in standalone.xml" do
  cwd "#{node[:jbpm][:workdir]}"
  command "sed -i '/<system-properties>/r system_properties.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :immediately
  not_if "grep 'property name=\"org.kie.demo\" value=\"false\"' #{node[:jbpm][:home]}/configuration/standalone.xml"
end

cookbook_file "#{node[:jbpm][:workdir]}/delete_work_dir.xml"

execute "Delete work dir in standalone.xml" do
  cwd "#{node[:jbpm][:workdir]}"
  command "sed -i '/<system-properties>/r delete_work_dir.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :immediately
  not_if "grep org.jboss.as.web.deployment.DELETE_WORK_DIR_ONCONTEXTDESTROY #{node[:jbpm][:home]}/configuration/standalone.xml"
end

# stop sending log messages to console.log
execute "Delete console log handler in standalone.xml" do
  cwd "#{node[:jbpm][:home]}/configuration"
  command "sed -i '/<handler name=\"CONSOLE\"\\/>/d' ./standalone.xml"
  notifies :restart, "service[jboss]", :delayed
  only_if "grep '<handler name=\"CONSOLE\"/>' ./standalone.xml"
end

#  configure jboss-logging for requestId and sessionId
execute "Configure jboss-logging for requestId and sessionId in standalone.xml" do
  command "sed -i.orig 's/%d{HH:mm:ss,SSS} %-5p \\[%c\\] (%t)/& hostname:%X{hostname}, requestId:%X{requestId}, sessionId:%X{sid}/' #{node[:jbpm][:home]}/configuration/standalone.xml"
  not_if "grep 'requestId:%X{requestId}' #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :restart, "service[jboss]", :delayed
end

#  Set jboss-logging level from the default attribute value for root logger
execute "Set jboss-logging level from chef attribute value for root logger in standalone.xml" do
  command "sed -i.orig '/<root-logger>/{n;s/.*/                <level name=\"#{node[:jbpm][:log_level]}\"\\/>/}' #{node[:jbpm][:home]}/configuration/standalone.xml"
  not_if "cat #{node[:jbpm][:home]}/configuration/standalone.xml | tr -d '\n' | grep \"<root-logger>\\s*<level name=\\\"#{node[:jbpm][:log_level]}\""
  notifies :restart, "service[jboss]", :delayed
end

#Deploy JbpmUtils jar
remote_file "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/lib/JbpmUtils.jar" do
   owner 'jboss'
   mode   '0755'
   source node[:jbpm_utils_artifacts][:source]
   use_conditional_get true
   notifies :restart, "service[jboss]", :immediately
end

#Configure business-central web.xml
webxml = "  <!-- LoggingServletRequestListener -->\\
  <listener>\\
    <listener-class>\\
      vistacore.jbpm.utils.logging.listener.LoggingServletRequestListener\\
    <\\/listener-class>\\
  <\\/listener>\\
  <!-- RequestIdFilter -->\\
  <filter>\\
    <filter-name>requestIdFilter<\\/filter-name>\\
    <filter-class>vistacore.jbpm.utils.logging.filter.RequestIdFilter<\\/filter-class>\\
  <\\/filter>\\
    <filter-mapping>\\
    <filter-name>requestIdFilter<\\/filter-name>\\
    <url-pattern>\\/*<\\/url-pattern>\\
  <\\/filter-mapping>\\
"
execute "insert_request_id_filter" do
  cwd "#{node[:jbpm][:home]}/deployments/business-central.war/WEB-INF/"
  user 'jboss'
  command "sed -i.orig 's/<\\/web-app>/#{webxml}\\n&/' web.xml"
  not_if "grep 'LoggingServletRequestListener' web.xml"
  notifies :restart, "service[jboss]", :immediately
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

jbpm_check_war_deployment "dashbuilder"
jbpm_check_war_deployment "business-central"

# indexes are created after jbpm has connected to Oracle and created its own tables
# and before jbpm_deploy_jar is called
cookbook_file "#{node[:jbpm][:workdir]}/create_jbpm_indexes.sql"
execute "Create jbpm indexes" do
  cwd node[:jbpm][:workdir]
  command "sqlplus -s /nolog <<-EOF> #{node[:jbpm][:workdir]}/create_jbpm_indexes.log
    SET FEEDBACK ON SERVEROUTPUT ON
    WHENEVER OSERROR EXIT 9;
    WHENEVER SQLERROR EXIT SQL.SQLCODE;
    connect #{jbpm_username}/#{jbpm_password}@(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=#{oracle_ip})(PORT=#{oracle_port}))(CONNECT_DATA=(SERVICE_NAME=#{oracle_sid})))
    @create_jbpm_indexes.sql
    EXIT
  EOF"
  sensitive true
  notifies :start, "service[jboss]", :before
end

jbpm_deploy_jar "deploy_fit_lab_jar" do
  user admin_username
  password admin_password
  group_id node[:jbpm][:organization]
  artifact_id "FITLabProject"
  version node[:jbpm_fit_artifacts][:version]
  jar_source node[:jbpm_fit_artifacts][:source]
  remove_legacy_jars node[:jbpm][:configure][:remove_legacy_jars]
  owner 'jboss'
  group 'jboss'
  mode  '0755'
end

jbpm_deploy_jar "deploy_general_medicine_jar" do
  user admin_username
  password admin_password
  group_id node[:jbpm][:organization]
  artifact_id "General_Medicine"
  version node[:jbpm_general_medicine_artifacts][:version]
  jar_source node[:jbpm_general_medicine_artifacts][:source]
  remove_legacy_jars node[:jbpm][:configure][:remove_legacy_jars]
  owner 'jboss'
  group 'jboss'
  mode  '0755'
end

jbpm_deploy_jar "deploy_order_jar" do
  user admin_username
  password admin_password
  group_id node[:jbpm][:organization]
  artifact_id "Order"
  version node[:jbpm_order_artifacts][:version]
  jar_source node[:jbpm_order_artifacts][:source]
  remove_legacy_jars node[:jbpm][:configure][:remove_legacy_jars]
  owner 'jboss'
  group 'jboss'
  mode  '0755'
end

jbpm_deploy_jar "deploy_activity_jar" do
  user admin_username
  password admin_password
  group_id node[:jbpm][:organization]
  artifact_id "Activity"
  version node[:jbpm_activity_artifacts][:version]
  jar_source node[:jbpm_activity_artifacts][:source]
  remove_legacy_jars node[:jbpm][:configure][:remove_legacy_jars]
  owner 'jboss'
  group 'jboss'
  mode  '0755'
end

jbpm_clean_up_jars "delete_undeployed_jars" do
  user admin_username
  password admin_password
  only_if { node[:jbpm][:configure][:remove_legacy_jars] }
end

# cleanup activitydb data from the database
cookbook_file "#{node[:jbpm][:workdir]}/cleanup_activitydb_data.sql"
execute "cleanup activitydb" do
  cwd node[:jbpm][:workdir]
  command "sqlplus -s /nolog <<-EOF>> #{node[:jbpm][:workdir]}/cleanup_activitydb_data.log
    WHENEVER OSERROR EXIT 9;
    WHENEVER SQLERROR EXIT SQL.SQLCODE;
    connect #{jbpm_username}/#{jbpm_password}@(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=#{oracle_ip})(PORT=#{oracle_port}))(CONNECT_DATA=(SERVICE_NAME=#{oracle_sid})))
    @cleanup_activitydb_data.sql
    EXIT
  EOF"
  sensitive true
  only_if { node[:jbpm][:configure][:cleanup_activitydb_data]  }
end
