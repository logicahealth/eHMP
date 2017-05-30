#
# Cookbook Name:: rdk
# Recipe:: config
#

include_recipe "rdk::service" # Included due to notify dependency from templates to service

jbpm_admin_password = Chef::EncryptedDataBagItem.load("credentials", "jbpm_admin_password", node[:data_bag_string])["password"]
jbpm_nurseuser_password = Chef::EncryptedDataBagItem.load("credentials", "jbpm_nurseuser_password", node[:data_bag_string])["password"]
jbpm_activitydbuser_password = Chef::EncryptedDataBagItem.load("credentials", "jbpm_activitydbuser_password", node[:data_bag_string])["password"]
jbpm_notifdb_password = Chef::EncryptedDataBagItem.load("credentials", "jbpm_notifdb_password", node[:data_bag_string])["password"]
mongodb_creds = Chef::EncryptedDataBagItem.load("credentials", node[:mongodb_creds_db] || "mongodb", node[:data_bag_string])["rdk"]
rdk_secure_passcode_list = Chef::EncryptedDataBagItem.load("resource_server", "config", node[:data_bag_string])["passcode"]

if find_optional_nodes_by_criteria(node[:stack], "role:jds_app_server").empty?
  raise "No JDS App Server has been found, yet you attempted to point to a jds_app_server" unless node[:rdk][:jds_app_server_ident].nil?
  jds = find_node_by_role("jds", node[:stack])
else
  raise "JDS App Servers have been found in this environment, but a jds_app_server_ident was not set." if node[:rdk][:jds_app_server_ident].nil?
  jds = find_optional_node_by_criteria(node[:stack], "role:jds_app_server AND jds_app_server_ident:#{node[:rdk][:jds_app_server_ident]}")
  raise "JDS App Server #{node[:rdk][:jds_app_server_ident]} not found in stack." if jds.nil?
end

pjds = find_node_by_role("pjds", node[:stack], "jds")
solr = find_node_by_role("solr", node[:stack], "mocks")
vxsync_nodes = find_multiple_nodes_by_role("vxsync", node[:stack])
vxsync = find_node_by_role("vxsync_client", node[:stack])
vhic = find_node_by_role("vhic", node[:stack], "mocks")
asu = find_node_by_role("asu", node[:stack], "vxsync")
mvi = find_node_by_role("mvi", node[:stack], "mocks")
jbpm = find_optional_node_by_role("jbpm", node[:stack])
cdsinvocation = find_optional_node_by_role("cdsinvocation", node[:stack])
cdsdb = find_optional_node_by_role("cdsdb", node[:stack])
oracle_node = find_optional_node_by_role("ehmp_oracle", node[:stack])
begin
  crs = find_optional_node_by_role("crs", node[:stack]) || data_bag_item('servers', 'crs').to_hash
rescue
  Chef::Log.warn "No CRS machine found.  This is not required, so we will continue deployment without connecting to CRS."
  crs = nil
end
begin
  vix = find_optional_node_by_role("vix", node[:stack]) || data_bag_item('servers', 'vix').to_hash
rescue
  Chef::Log.warn "No Vix machine found.  This is not required, so we will continue deployment without connecting to Vix."
  vix = nil
end
vistas = find_multiple_nodes_by_role("vista-.*", node[:stack])

jbpm_communicationuser_password = Chef::EncryptedDataBagItem.load("credentials", oracle_node[:ehmp_oracle][:communication][:user_communicationuser_item], node[:data_bag_string])["password"] if !oracle_node.nil?

# Create config file
template("#{node[:rdk][:home_dir]}/config/ehmp-config.json") do
  source "ehmp-config.json.erb"
  variables(
    :trackSolrStorage => node['rdk']['trackSolrStorage'],
    :solrIndexingDelayMillis => node['rdk']['settings']['solrIndexingDelayMillis']
  )
  mode '0644'
end

# Create config files for each service
node[:rdk][:services].each do |name, config|

  # Delete config files if necessary
  ruby_block 'Cleanup config files' do
    block do
      number_of_processes = config[:processes]
      config_list = Dir.glob("#{config[:config_destination]}-*.json").sort!
      if number_of_processes < config_list.size # Only process files if you want to go from high process count to lower process count
        begin
          config_list.slice!(number_of_processes, config_list.size - number_of_processes - 1) # Delete starting at index number_of_processes and go for remaining length
          config_list.each do |config_file|
            File.delete config_file
          end
        rescue
        end
      end
    end
  end

  # Create base config file
  template("#{config[:config_destination]}.json") do
    source "#{config[:config_source]}"
    variables(
      :jds => jds,
      :pjds => pjds,
      :solr => solr,
      :vxsync => vxsync,
      :vhic => vhic,
      :asu => asu,
      :mvi => mvi,
      :vix => vix,
      :jbpm => jbpm,
      :cdsinvocation => cdsinvocation,
      :cdsdb => cdsdb,
      :mongodb_creds => mongodb_creds,
      :sslCACertName => "#{node[:rdk][:home_dir]}/config/#{node[:rdk][:sslCACertName]}",
      :crs => crs,
      :vista_sites => vistas,
      :log_directory => node[:rdk][:log_dir],
      :secure_passcode_list => rdk_secure_passcode_list,
      :jbpm_admin_password => jbpm_admin_password,
      :jbpm_nurseuser_password => jbpm_nurseuser_password,
      :jbpm_activitydbuser_password => jbpm_activitydbuser_password,
      :jbpm_communicationuser_password => (jbpm_communicationuser_password if !oracle_node.nil?),
      :jbpm_notifdb_password => jbpm_notifdb_password,
      :port => config[:port],
      :fetch_host => "localhost:#{node[:synapse][:services][:fetch_server][:haproxy][:port]}",
      :write_back_host => "localhost:#{node[:synapse][:services][:write_back][:haproxy][:port]}",
      :pick_list_host => "localhost:#{node[:synapse][:services][:pick_list][:haproxy][:port]}",
      :complex_note_port => node[:rdk][:complex_note_port],
      :index => 0,
      :jds_sync_settings => node[:rdk][:jdsSync][:settings],
      :resync_settings => node[:rdk][:resync],
      :cookie_prefix => node[:rdk][:cookie_prefix],
      :oracle_ip => (oracle_node[:ipaddress] if !oracle_node.nil?),
      :oracle_sid => (oracle_node[:ehmp_oracle][:oracle_sid] if !oracle_node.nil?),
      :oracle_port => (oracle_node[:ehmp_oracle][:oracle_config][:port] if !oracle_node.nil?)
    )
    mode '0644'
    notifies :restart, "service[#{config[:service]}]"
  end

  # Create remaining config files for dynamic processes. rdk-1, rdk-2, etc.
  1.upto(config[:processes]) do |index|

    activity_vxsync = nil
    if name == "activity_handler"
      vxsync_list_index = (index - 1) % node[:rdk][:services][:activity_handler][:vxsync_list].length
      vxsync_nodes.each{ |machine|
        activity_vxsync = machine if machine[:db_item] == node[:rdk][:services][:activity_handler][:vxsync_list][vxsync_list_index]
      }
      raise "Vxsync #{node[:rdk][:services][:activity_handler][:vxsync_list][vxsync_list_index]} not found in stack." if activity_vxsync.nil?
    end

    template("#{config[:config_destination]}-#{index}.json") do
      source "#{config[:config_source]}"
      variables(
        :jds => jds,
        :pjds => pjds,
        :solr => solr,
        :vxsync => activity_vxsync || vxsync,
        :vhic => vhic,
        :asu => asu,
        :mvi => mvi,
        :vix => vix,
        :jbpm => jbpm,
        :cdsinvocation => cdsinvocation,
        :cdsdb => cdsdb,
        :mongodb_creds => mongodb_creds,
        :sslCACertName => "#{node[:rdk][:home_dir]}/config/#{node[:rdk][:sslCACertName]}",
        :crs => crs,
        :vista_sites => vistas,
        :log_directory => node[:rdk][:log_dir],
        :secure_passcode_list => rdk_secure_passcode_list,
        :jbpm_admin_password => jbpm_admin_password,
        :jbpm_nurseuser_password => jbpm_nurseuser_password,
        :jbpm_activitydbuser_password => jbpm_activitydbuser_password,
        :jbpm_communicationuser_password => (jbpm_communicationuser_password if !oracle_node.nil?),
        :jbpm_notifdb_password => jbpm_notifdb_password,
        :port => config[:port].nil? ? nil : config[:port] - ( index - 1 ),
        :fetch_host => "localhost:#{node[:synapse][:services][:fetch_server][:haproxy][:port]}",
        :write_back_host => "localhost:#{node[:synapse][:services][:write_back][:haproxy][:port]}",
        :pick_list_host => "localhost:#{node[:synapse][:services][:pick_list][:haproxy][:port]}",
        :complex_note_port => node[:rdk][:complex_note_port],
        :index => index,
        :jds_sync_settings => node[:rdk][:jdsSync][:settings],
        :resync_settings => node[:rdk][:resync],
        :cookie_prefix => node[:rdk][:cookie_prefix],
        :oracle_ip => (oracle_node[:ipaddress] if !oracle_node.nil?),
        :oracle_sid => (oracle_node[:ehmp_oracle][:oracle_sid] if !oracle_node.nil?),
        :oracle_port => (oracle_node[:ehmp_oracle][:oracle_config][:port] if !oracle_node.nil?)
      )
      mode '0644'
      notifies :restart, "service[#{config[:service]}]"
    end
  end
end
