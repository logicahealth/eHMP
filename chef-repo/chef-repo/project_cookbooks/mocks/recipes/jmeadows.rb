#
# Cookbook Name:: mocks
# Recipe:: jmeadows
#
# Deploys and configures jmeadows artifacts
#

node[:mocks][:jmeadows][:artifacts].each_pair do |artifact_name, artifact_url|
  file "#{node[:mocks][:glassfish][:autodeploy_dir]}/#{artifact_name}.war_deployed" do
    action :nothing
  end

  file "#{node[:mocks][:glassfish][:autodeploy_dir]}/#{artifact_name}.war_deployFailed" do
    action :nothing
  end

  # download the artifact to the file_cache
  remote_file "#{Chef::Config[:file_cache_path]}/#{artifact_name}.war" do
    use_conditional_get true
    source artifact_url
    action :create
    notifies :delete, "file[#{node[:mocks][:glassfish][:autodeploy_dir]}/#{artifact_name}.war]", :immediately
    notifies :delete, "file[#{node[:mocks][:glassfish][:autodeploy_dir]}/#{artifact_name}.war_deployed]", :immediately
    notifies :delete, "file[#{node[:mocks][:glassfish][:autodeploy_dir]}/#{artifact_name}.war_deployFailed]", :immediately
  end

  file "#{node[:mocks][:glassfish][:autodeploy_dir]}/#{artifact_name}.war" do
    content lazy { IO.read("#{Chef::Config[:file_cache_path]}/#{artifact_name}.war") }
    action :create
  end

  # wait for .war_deployed or .war_deployFailed file to be created
  mocks_wait_for_autodeploy "#{node[:mocks][:glassfish][:autodeploy_dir]}/#{artifact_name}.war" do
    timeout 120
    action :execute
  end
end

sqlserver_password = Chef::EncryptedDataBagItem.load("credentials", "mocks_sqlserver_password", node[:data_bag_string])["password"]
sql_url = "jdbc:sqlserver://#{node[:mocks][:jmeadows][:sql_server_ip]};database=JLV;user=jlvuser;password=#{sqlserver_password};SelectedMethod=Cursor;"
vler = find_node_by_role("vler", node[:stack], "mocks")
jmeadows = find_node_by_role("jmeadows", node[:stack], "mocks")

# Overwrite configuration files with environment-dependent IP addresses
template "#{node[:mocks][:glassfish][:application_dir]}/jMeadows/WEB-INF/classes/appconfig-development.properties" do
  source "jmeadows/appconfig-development.properties.erb"
  variables(
    :sql_url => sql_url,
    :jmeadows => jmeadows
  )
  action :create
  notifies :restart, 'service[glassfish]', :delayed
end

template "#{node[:mocks][:glassfish][:application_dir]}/BHIERelayService/WEB-INF/classes/bhierelay.properties" do
  source "bhierelayservice/bhierelay.properties.erb"
  variables(
    :vler => vler
  )
  action :create
  notifies :restart, 'service[glassfish]', :delayed
end

template "#{node[:mocks][:glassfish][:application_dir]}/VistaDataService/WEB-INF/classes/appconfig-development.properties" do
  source "vds/appconfig-development.properties.erb"
  variables(
    :vler => vler
  )
  action :create
  notifies :restart, 'service[glassfish]', :delayed
end
