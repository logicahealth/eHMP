#
# Cookbook Name:: opencds
# Recipe:: deploy_knowledge_repo
#

yum_package "unzip"

directory node[:opencds][:deploy_knowledge_repo][:app_home] do
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  recursive true
end

directory node[:opencds][:deploy_knowledge_repo][:properties_dir] do
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  recursive true
end

properties_path = "#{node[:tomcat][:user_home]}/OpenCDS/opencds-knowledge-repository-data/src/main/resources/"

template "#{node[:opencds][:deploy_knowledge_repo][:properties_dir]}/opencds.properties" do
  source "opencds.properties.erb"
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  variables(
      :properties_path => properties_path
    )
  notifies :touch, "file[#{node[:opencds][:deploy_war][:deployed_war_file]}]", :delayed
end

opencds_credentials = Chef::EncryptedDataBagItem.load("credentials", "opencds_username_password", node[:data_bag_string])
username = opencds_credentials["username"]
password = opencds_credentials["password"]
template "#{node[:opencds][:deploy_knowledge_repo][:properties_dir]}/config-security.xml" do
  source "config-security.xml.erb"           
  variables(
    :username => username,
    :password => password
  )
  action :create 
end

remote_file node[:opencds][:deploy_knowledge_repo][:zip_file] do
  source node[:opencds][:zip_source]
  mode "0755"
  use_conditional_get true
  notifies :delete, "directory[#{node[:opencds][:deploy_knowledge_repo][:repo_dir]}]", :immediately
end

directory node[:opencds][:deploy_knowledge_repo][:repo_dir] do
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  recursive true
  action :create
end

execute 'unzip_opencds_knowledge_repository_data' do
  cwd node[:opencds][:deploy_knowledge_repo][:repo_dir]
  command "unzip #{node[:opencds][:deploy_knowledge_repo][:zip_file]}"
  only_if { (Dir.entries(node[:opencds][:deploy_knowledge_repo][:repo_dir]) - %w{ . .. }).empty? }
end
