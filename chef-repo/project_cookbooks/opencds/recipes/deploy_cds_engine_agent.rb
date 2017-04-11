#
# Cookbook Name:: opencds
# Recipe:: deploy-cds-engine-agent
#

directory node[:opencds][:deploy_cds_engine_agent][:app_dir] do
  recursive true
  action :nothing
end

remote_file "#{Chef::Config[:file_cache_path]}/#{node[:opencds][:deploy_cds_engine_agent][:app_name]}.war" do
  source node[:opencds][:cds_engine_agent_source]
  mode "0755"
  use_conditional_get true
  notifies :stop, "service[#{node[:tomcat][:service]}]", :immediately
  notifies :delete, "directory[#{node[:opencds][:deploy_cds_engine_agent][:app_dir]}]", :immediately
  notifies :delete, "file[#{node[:opencds][:deploy_cds_engine_agent][:deployed_war_file]}]", :immediately
end

file "#{node[:opencds][:deploy_cds_engine_agent][:deployed_war_file]}" do
  content lazy { IO.read(node[:opencds][:deploy_cds_engine_agent][:downloaded_war_file]) }
  owner "root"
  group "root"
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :immediately
end
