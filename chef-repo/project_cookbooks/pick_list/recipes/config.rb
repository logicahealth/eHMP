#
# Cookbook Name:: pick_list
# Recipe:: config
#

jbpm_admin_username = data_bag_item("credentials", "jbpm_admin_password", node[:data_bag_string])["username"]
jbpm_admin_password = data_bag_item("credentials", "jbpm_admin_password", node[:data_bag_string])["password"]
jbpm_nurseuser_username = data_bag_item("credentials", "jbpm_nurseuser_password", node[:data_bag_string])["username"]
jbpm_nurseuser_password = data_bag_item("credentials", "jbpm_nurseuser_password", node[:data_bag_string])["password"]
oracle_ehmpuser_username = data_bag_item("credentials", "oracle_user_ehmpuser", node[:data_bag_string])["username"]
oracle_ehmpuser_password = data_bag_item("credentials", "oracle_user_ehmpuser", node[:data_bag_string])["password"]
pick_list_secure_passcode_list = data_bag_item("resource_server", "config", node[:data_bag_string])["passcode"]

if find_optional_nodes_by_criteria(node[:stack], "role:jds_app_server").empty?
  raise "No JDS App Server has been found, yet you attempted to point to a jds_app_server" unless node[:pick_list][:jds_app_server_assignment].nil?
  jds = find_node_by_role("jds", node[:stack])
else
  raise "JDS App Servers have been found in this environment, but a jds_app_server_assignment was not set." if node[:pick_list][:jds_app_server_assignment].nil?
  jds = find_optional_node_by_criteria(node[:stack], "role:jds_app_server AND jds_app_server_ident:#{node[:pick_list][:jds_app_server_assignment]}")
  raise "JDS App Server #{node[:pick_list][:jds_app_server_assignment]} not found in stack." if jds.nil?
end

pjds = find_node_by_role("pjds", node[:stack], "jds")
# get zookeeper information from first zookeeper node found (node[:zookeeper][:zookeeper_connection] should be the same for all zookeeper nodes)
zookeeper = find_multiple_nodes_by_role("zookeeper", node[:stack])[0]
vhic = find_node_by_role("vhic", node[:stack], "mocks")
mvi = find_node_by_role("mvi", node[:stack], "mocks")
oracle = find_optional_node_by_role("ehmp_oracle", node[:stack])
vistas = find_multiple_nodes_by_role("vista-.*", node[:stack])

if node[:pick_list][:enable_app_dynamics]
  app_dynamics = find_node_by_role("app_dynamics", node[:stack])
end

# Create config file
template("#{node[:pick_list][:home_dir]}/config/ehmp-config.json") do
  source "ehmp-config.json.erb"
  variables(
    :trackSolrStorage => node['pick_list']['trackSolrStorage'],
    :solrIndexingDelayMillis => node['pick_list']['settings']['solrIndexingDelayMillis']
  )
  owner node[:pick_list][:user]
  group node[:pick_list][:group]
  mode '0644'
end

# Create config files for each service
config = node[:pick_list][:service_config]

# Delete config files if necessary
ruby_block "Cleanup #{config[:name]} config files" do
  block do
    number_of_processes = config[:processes]
    nerve_list = Dir.glob("#{node[:nerve][:nerve_conf_dir]}/#{config[:name]}*").sort!
    config_list = Dir.glob("#{config[:destination]}-*.json").sort!
    if number_of_processes < nerve_list.size # Only process files if you want to go from high process count to lower process count
      begin
        nerve_list[number_of_processes, nerve_list.size - number_of_processes].each do |nerve_file| # Delete starting at index number_of_processes to the end of the array.
          File.delete nerve_file
        end
        config_list[number_of_processes, config_list.size - number_of_processes].each do |config_file|
          File.delete config_file
        end
      rescue
      end
    end
  end
end

# Create remaining config files for dynamic processes. pick_list-1, pick_list-2, etc.
1.upto(config[:processes]) do |index|

  port = config[:port].nil? ? nil : config[:port] - ( index - 1 )

  template("#{config[:destination]}-#{index}.json") do
    source "#{config[:source]}"
    variables(
      :jds => jds,
      :pjds => pjds,
      :zookeeper => zookeeper,
      :vxsync_sync_host => "localhost:#{node[:synapse][:services][:vxsync_sync][:haproxy][:port]}",
      :vhic => vhic,
      :asu_host => "localhost:#{node[:synapse][:services][:asu][:haproxy][:port]}",
      :mvi => mvi,
      :jbpm_host => "localhost:#{node[:synapse][:services][:jbpm][:haproxy][:port]}",
      :jbpm_admin_username => jbpm_admin_username,
      :jbpm_admin_password => jbpm_admin_password,
      :jbpm_nurseuser_username => jbpm_nurseuser_username,
      :jbpm_nurseuser_password => jbpm_nurseuser_password,
      :oracle => oracle,
      :vista_sites => vistas,
      :log_directory => node[:pick_list][:log_dir],
      :secure_passcode_list => pick_list_secure_passcode_list,
      :oracle_ehmpuser_password => (oracle_ehmpuser_password if !oracle.nil?),
      :oracle_ehmpuser_username => (oracle_ehmpuser_username if !oracle.nil?),
      :port => port,
      :fetch_host => "localhost:#{node[:synapse][:services][:fetch_server][:haproxy][:port]}",
      :write_back_host => "localhost:#{node[:synapse][:services][:write_back][:haproxy][:port]}",
      :complex_note_port => node[:synapse][:services][:vxsync_sync][:haproxy][:port],
      :index => index,
      :jds_sync_settings => node[:pick_list][:jdsSync][:settings],
      :resync_settings => node[:pick_list][:resync],
      :cookie_prefix => node[:pick_list][:cookie_prefix],
      :max_sockets => config[:max_sockets],
      :app_dynamics => app_dynamics
    )
    owner node[:pick_list][:user]
    group node[:pick_list][:group]
    mode '0644'
    notifies :restart, "service[#{config[:name]}]"
  end

  nerve_wrapper "#{config[:name]}-#{index}" do
    host node[:ipaddress]
    port port
    checks config[:nerve][:checks]
    check_interval config[:nerve][:check_interval]
    service_type config[:name]
  end

end

link "#{config[:destination]}.json" do
  action :delete
  only_if "test -L #{config[:destination]}.json"
end

file "#{config[:destination]}.json" do
  content lazy { ::File.read("#{config[:destination]}-1.json") }
  owner node[:pick_list][:user]
  group node[:pick_list][:group]
  mode '0644'
  notifies :restart, "service[#{config[:name]}]"
end
