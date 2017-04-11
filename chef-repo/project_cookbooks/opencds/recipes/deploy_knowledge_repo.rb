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

template "#{node[:opencds][:deploy_knowledge_repo][:properties_dir]}/opencds.properties" do
  source "opencds.properties.erb"
  owner node[:tomcat][:user]
  group node[:tomcat][:group]
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :delayed
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
