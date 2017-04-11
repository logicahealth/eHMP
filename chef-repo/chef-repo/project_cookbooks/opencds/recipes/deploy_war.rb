#
# Cookbook Name:: opencds
# Recipe:: deploy_war
#

remote_file "#{Chef::Config[:file_cache_path]}/#{node[:opencds][:deploy_war][:app_name]}.war" do
  source node[:opencds][:deploy_war][:source]
  mode "0755"
  use_conditional_get true
end

file "#{node[:opencds][:deploy_war][:deployed_war_file]}" do
  content lazy { IO.read(node[:opencds][:deploy_war][:downloaded_war_file]) }
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :delayed
end

link "#{node[:tomcat][:webapp_dir]}/opencds" do
  to node[:opencds][:deploy_war][:app_dir]
  owner node[:tomcat][:user]
  group node[:tomcat][:user]
  mode "0775"
end

opencds_credentials = Chef::EncryptedDataBagItem.load("credentials", "opencds_username_password", node[:data_bag_string])
username = opencds_credentials["username"]
password = opencds_credentials["password"]
token = Base64.encode64("#{username}:#{password}")
http_request 'reloading endpoint' do
  action :get
  url 'http://localhost:8080/opencds-decision-support-service/config/v1/reload'
  headers({'AUTHORIZATION' => "Basic #{token}",'Content-Type' => 'application/data'})
  #wait for wars to deploy
  retries 20
  retry_delay 5
end
