#
# Cookbook Name:: rdk
# Recipe:: config
#

include_recipe "rdk::service" # Included due to notify dependency from templates to service

jbpm_admin_password = Chef::EncryptedDataBagItem.load("credentials", "jbpm_admin_password", 'k33p1ts@f3')["password"]
jbpm_nurseuser_password = Chef::EncryptedDataBagItem.load("credentials", "jbpm_nurseuser_password", 'k33p1ts@f3')["password"]
jbpm_activitydbuser_password = Chef::EncryptedDataBagItem.load("credentials", "jbpm_activitydbuser_password", 'k33p1ts@f3')["password"]
rdk_secure_passcode_list = Chef::EncryptedDataBagItem.load("resource_server", "config", 'k33p1ts@f3')["passcode"]

# Find other machines using find_nodes in common cookbook
jds = find_node_by_role("jds", node[:stack])
pjds = find_node_by_role("pjds", node[:stack], "jds")
solr = find_node_by_role("solr", node[:stack], "mocks")
vxsync = find_node_by_role("vxsync", node[:stack])
vhic = find_node_by_role("vhic", node[:stack], "mocks")
asu = find_node_by_role("asu", node[:stack], "vxsync")
mvi = find_node_by_role("mvi", node[:stack], "mocks")
jbpm = find_optional_node_by_role("jbpm", node[:stack])
cdsinvocation = find_optional_node_by_role("cdsinvocation", node[:stack])
cdsdb = find_optional_node_by_role("cdsdb", node[:stack])
begin
  crs = find_optional_node_by_role("crs", node[:stack]) || data_bag_item('servers', 'crs').to_hash
rescue
  Chef::Log.warn "No CRS machine found.  This is not required, so we will continue deployment without connecting to CRS."
  crs = nil
end
vistas = find_multiple_nodes_by_role("vista-.*", node[:stack])

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
      :jbpm => jbpm,
      :cdsinvocation => cdsinvocation,
      :cdsdb => cdsdb,
      :crs => crs,
      :vista_sites => vistas,
      :log_directory => node[:rdk][:log_dir],
      :secure_passcode_list => rdk_secure_passcode_list,
      :jbpm_admin_password => jbpm_admin_password,
      :jbpm_nurseuser_password => jbpm_nurseuser_password,
      :jbpm_activitydbuser_password => jbpm_activitydbuser_password,
      :port => config[:port],
      :complex_note_port => node[:rdk][:complex_note_port],
      :index => 0,
      :jds_sync_settings => node[:rdk][:jdsSync][:settings],
      :resync_settings => node[:rdk][:resync],
      :cookie_prefix => node[:rdk][:cookie_prefix]
    )
    mode '0644'
    notifies :restart, "service[#{config[:service]}]"
  end

  # Create remaining config files for dynamic processes. rdk-1, rdk-2, etc. 
  1.upto(config[:processes]) do |index|
    template("#{config[:config_destination]}-#{index}.json") do
      source "#{config[:config_source]}"
      variables(
        :jds => jds,
        :pjds => pjds,
        :solr => solr,
        :vxsync => vxsync,
        :vhic => vhic,
        :asu => asu,
        :mvi => mvi,
        :jbpm => jbpm,
        :cdsinvocation => cdsinvocation,
        :cdsdb => cdsdb,
        :crs => crs,
        :vista_sites => vistas,
        :log_directory => node[:rdk][:log_dir],
        :secure_passcode_list => rdk_secure_passcode_list,
        :jbpm_admin_password => jbpm_admin_password,
        :jbpm_nurseuser_password => jbpm_nurseuser_password,
        :jbpm_activitydbuser_password => jbpm_activitydbuser_password,
        :port => config[:port].nil? ? nil : config[:port] - 1 + index,
        :fetch_host => "localhost:#{node[:rdk][:services][:fetch_server][:port]}",		# Not sure of the best way to do this
        :write_back_host => "localhost:#{node[:rdk][:services][:write_back][:port]}",	# Not sure of the best way to do this
        :pick_list_host => "localhost:#{node[:rdk][:services][:pick_list][:port]}",		# Not sure of the best way to do this
        :complex_note_port => node[:rdk][:complex_note_port],
        :index => index,
        :jds_sync_settings => node[:rdk][:jdsSync][:settings],
        :resync_settings => node[:rdk][:resync],
        :cookie_prefix => node[:rdk][:cookie_prefix]
      )
      mode '0644'
      notifies :restart, "service[#{config[:service]}]"
    end
  end
end
