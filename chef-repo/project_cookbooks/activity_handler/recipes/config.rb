#
# Cookbook Name:: activity_handler
# Recipe:: config
#

jbpm_admin_username = data_bag_item("credentials", "jbpm_admin_password", node[:data_bag_string])["username"]
jbpm_admin_password = data_bag_item("credentials", "jbpm_admin_password", node[:data_bag_string])["password"]
oracle_ehmpuser_username = data_bag_item("credentials", "oracle_user_ehmpuser", node[:data_bag_string])["username"]
oracle_ehmpuser_password = data_bag_item("credentials", "oracle_user_ehmpuser", node[:data_bag_string])["password"]

if find_optional_nodes_by_criteria(node[:stack], "role:jds_app_server").empty?
  raise "No JDS App Server has been found, yet you attempted to point to a jds_app_server" unless node[:activity_handler][:jds_app_server_assignment].nil?
  jds = find_node_by_role("jds", node[:stack])
else
  raise "JDS App Servers have been found in this environment, but a jds_app_server_assignment was not set." if node[:activity_handler][:jds_app_server_assignment].nil?
  jds = find_optional_node_by_criteria(node[:stack], "role:jds_app_server AND jds_app_server_ident:#{node[:activity_handler][:jds_app_server_assignment]}")
  raise "JDS App Server #{node[:activity_handler][:jds_app_server_assignment]} not found in stack." if jds.nil?
end

pjds = find_node_by_role("pjds", node[:stack], "jds")
oracle = find_optional_node_by_role("ehmp_oracle", node[:stack])
vistas = find_multiple_nodes_by_role("vista-.*", node[:stack])
vxsync_nodes = find_multiple_nodes_by_role("vxsync", node[:stack])

if node[:activity_handler][:enable_app_dynamics]
  app_dynamics = find_node_by_role("app_dynamics", node[:stack])
end

# Create ehmp-config file
template("#{node[:activity_handler][:home_dir]}/config/ehmp-config.json") do
  source "ehmp-config.json.erb"
  variables(
    :trackSolrStorage => node['activity_handler']['trackSolrStorage'],
    :solrIndexingDelayMillis => node['activity_handler']['settings']['solrIndexingDelayMillis']
  )
  owner node[:activity_handler][:user]
  group node[:activity_handler][:group]
  mode '0644'
end

config = node[:activity_handler][:service_config]

index = 0
vxsync_nodes.each do |vxsync|
  vxsync['vxsync']['vxsync_applications'].each do |application|
    1.upto(config[:handlers_per_vx]) do
      index = index + 1

      beanstalk_config = vxsync['beanstalk'][application]['beanstalk_processes']["jobrepo_#{application}"]['config']

      template("#{config[:destination]}-#{index}.json") do
        source "#{config[:source]}"
        variables(
          :jds => jds,
          :pjds => pjds,
          :vxsync => vxsync,
          :beanstalk_config => beanstalk_config,
          :jbpm_host => "localhost:#{node[:synapse][:services][:jbpm][:haproxy][:port]}",
          :jbpm_admin_username => jbpm_admin_username,
          :jbpm_admin_password => jbpm_admin_password,
          :oracle => oracle,
          :vista_sites => vistas,
          :oracle_ehmpuser_username => oracle_ehmpuser_username,
          :oracle_ehmpuser_password => oracle_ehmpuser_password,
          :app_dynamics => app_dynamics
        )
        mode '0644'
        owner node[:activity_handler][:user]
        group node[:activity_handler][:group]
        notifies :restart, "service[#{config[:name]}]"
      end
    end
  end
end

ruby_block 'Cleanup activity_handler config files' do
  block do
    config_list = Dir.glob("#{config[:destination]}-*.json").sort!
    if config[:processes] < config_list.size
      begin
        config_list.slice!(0, config[:processes])
        config_list.each do |config_file|
          File.delete config_file
        end
      rescue
      end
    end
  end
  only_if { config[:processes] < Dir.glob("#{config[:destination]}-*.json").size }
end
