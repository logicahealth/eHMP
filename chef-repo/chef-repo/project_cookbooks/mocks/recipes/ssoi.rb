#
# Cookbook Name:: mocks
# Recipe:: ssoi
#
# Deploys and configures ssoi artifacts
#

# ssoi users properties file
template "#{node[:mocks][:glassfish][:domain_dir]}/domain1/lib/classes/mockssoi.properties" do
  source "ssoi/mockssoi.properties.erb"
  action :create
end

# download the users json artifact into the glassfish doc root
remote_file "#{node[:mocks][:glassfish][:domain_dir]}/domain1/docroot/#{node[:mocks][:ssoi][:users_file]}" do
  source node[:mocks][:ssoi][:users_source]
  use_conditional_get true
  action :create
end

node[:mocks][:ssoi][:artifacts].each_pair do |artifact_name, artifact_url|
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
    action :execute
  end
end
