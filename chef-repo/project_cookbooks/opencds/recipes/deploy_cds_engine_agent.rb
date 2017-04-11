#
# Cookbook Name:: opencds
# Recipe:: deploy-cds-engine-agent
#

remote_file "#{Chef::Config[:file_cache_path]}/#{node[:opencds][:deploy_cds_engine_agent][:app_name]}.war" do
  source node[:opencds][:cds_engine_agent_source]
  mode "0755"
  use_conditional_get true
end

file "#{node[:opencds][:deploy_cds_engine_agent][:deployed_war_file]}" do
  content lazy { IO.read(node[:opencds][:deploy_cds_engine_agent][:downloaded_war_file]) }
  owner "root"
  group "root"
  mode "0755"
end
