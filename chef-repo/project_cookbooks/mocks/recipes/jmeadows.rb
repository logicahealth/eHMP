#
# Cookbook Name:: mocks
# Recipe:: jmeadows
#
# Deploys and configures jmeadows artifacts
#
#
# New Artifacts? -> Yes -> [ Delete old .war and .war_deployed] -> [ Restart to free memory ] -> [ Move new artifacts to autodeploy directory] -> [ Wait for deployment ] -> [ Update configuration ] -> [ Restart Glassfish ]
#              |
#              No
#              |
#           [ Done ]
#

jmeadows_artifacts = [
    {
      url: node[:mocks][:mock_vler_doc_query_url],
      name: node[:mocks][:vler_doc_query_name]
    },
    {
      url: node[:mocks][:mock_vler_doc_retrieve_url],
      name: node[:mocks][:vler_doc_retrieve_name]
    },
    {
      url: node[:mocks][:mock_jmeadows_pdws_url],
      name: node[:mocks][:mock_jmeadows_pdws_name]
    },
    {
      url: node[:mocks][:jmeadows_url],
      name: node[:mocks][:jmeadows_name]
    },
    {
      url: node[:mocks][:bhie_relay_url],
      name: node[:mocks][:bhie_relay_service_name]
    },
    {
      url: node[:mocks][:mock_dod_adaptor_url],
      name: node[:mocks][:dod_adaptor_name]
    },
    {
      url: node[:mocks][:vds_url],
      name: node[:mocks][:vds_name]
    }
]

jmeadows_artifacts.each do | artifact |
  # stage the files required for configuring jmeadows
  remote_file "#{Chef::Config[:file_cache_path]}/#{artifact[:name]}.war" do
    use_conditional_get true
    #checksum open("#{artifact[:url]}.sha1", ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE).string
    action :create
    source artifact[:url]
  end

  # delete autodeployed war
  file "#{node[:mocks][:glassfish_autodeploy_dir]}/#{artifact[:name]}.war" do
    action :nothing
    subscribes :delete, "remote_file[#{Chef::Config[:file_cache_path]}/#{artifact[:name]}.war]", :immediately
  end

  file "#{node[:mocks][:glassfish_autodeploy_dir]}/#{artifact[:name]}.war_deployed" do
    action :nothing
    subscribes :delete, "remote_file[#{Chef::Config[:file_cache_path]}/#{artifact[:name]}.war]", :immediately
    notifies :restart, "service[glassfish]", :immediately
  end

  execute "autodeploy #{artifact[:name]}" do
    command "cp #{Chef::Config[:file_cache_path]}/#{artifact[:name]}.war #{node[:mocks][:glassfish_autodeploy_dir]}"
    subscribes :run, "file[#{node[:mocks][:glassfish_autodeploy_dir]}/#{artifact[:name]}.war_deployed]", :immediately
    notifies :restart, "service[glassfish]", :delayed
    action :run
    only_if { !File.exists?("#{node[:mocks][:glassfish_autodeploy_dir]}/#{artifact[:name]}.war_deployed") }
  end

  # wait for autodeployment to complete
  mocks_wait_for_file "#{artifact[:name]}.war_deployed" do
    action :execute
    file_name artifact[:name]
    file_path node[:mocks][:glassfish_autodeploy_dir]
    file_type "war_deployed"
    log node[:mocks][:chef_log]
  end
end

sqlserver_password = Chef::EncryptedDataBagItem.load("credentials", "mocks_sqlserver_password", 'n25q2mp#h4')["password"]  
sql_url = "jdbc:sqlserver://#{node[:mocks][:sql_server_ip]};database=JLV;user=jlvuser;password=#{sqlserver_password};SelectedMethod=Cursor;"

# Overwrite configuration files with environment-dependent IP addresses
template "#{node[:mocks][:glassfish_application_dir]}/#{node[:mocks][:jmeadows_name]}/WEB-INF/classes/appconfig-development.properties" do
  action :create
  source "jmeadows/appconfig-development.properties.erb"
  owner "root"
  group "root"
  mode "0644"
  variables(:sql_url => sql_url)
end

template "#{node[:mocks][:glassfish_application_dir]}/#{node[:mocks][:bhie_relay_service_name]}/WEB-INF/classes/bhierelay.properties" do
  action :create
  source "bhierelayservice/bhierelay.properties.erb"
  owner "root"
  group "root"
  mode "0644"
end

template "#{node[:mocks][:glassfish_application_dir]}/#{node[:mocks][:vds_name]}/WEB-INF/classes/appconfig-development.properties" do
  action :create
  source "vds/appconfig-development.properties.erb"
  owner "root"
  group "root"
  mode "0644"
end

service "glassfish" do
  supports :status => true
  action :nothing
end
