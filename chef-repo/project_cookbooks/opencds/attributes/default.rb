#
# Cookbook Name:: opencds
# Recipe:: default
#

default[:opencds][:server_name] = "opencds.vistacore.us"
default[:opencds][:fqdn] = "opencds.vistacore.us"
default[:opencds][:ajp][:port] = "8896"
default[:opencds][:jmx][:port] = "19988"

# DEPLOY_WAR:
default[:opencds][:deploy_war][:app_name] = "opencds-decision-support-service"
default[:opencds][:deploy_war][:app_dir] = "#{node[:tomcat][:webapp_dir]}/#{node[:opencds][:deploy_war][:app_name]}"
default[:opencds][:deploy_war][:deployed_war_file] = "#{node[:tomcat][:webapp_dir]}/#{node[:opencds][:deploy_war][:app_name]}.war"
default[:opencds][:deploy_war][:downloaded_war_file] = "#{Chef::Config[:file_cache_path]}/#{node[:opencds][:deploy_war][:app_name]}.war"
default[:opencds][:deploy_war][:version] = "2.0.0.90"
default[:opencds][:deploy_war][:source] = "#{node[:nexus_url]}/repositories/ehmp/filerepo/third-party/project/opencds/opencds/#{default[:opencds][:deploy_war][:version]}/opencds-#{default[:opencds][:deploy_war][:version]}.war"

# DEPLOY_KNOW_REPO:
default[:opencds][:deploy_knowledge_repo][:app_home] = "#{node[:tomcat][:user_home]}/OpenCDS"
default[:opencds][:deploy_knowledge_repo][:repo_dir] = "#{default[:opencds][:deploy_knowledge_repo][:app_home]}/opencds-knowledge-repository-data"
default[:opencds][:deploy_knowledge_repo][:zip_file] = "#{Chef::Config[:file_cache_path]}/opencds-knowledge-repository-data.zip"
default[:opencds][:deploy_knowledge_repo][:supporting_data_dir] = "#{default[:opencds][:deploy_knowledge_repo][:app_home]}/opencds-knowledge-repository-data/src/main/resources/resources_v1.3/supportingData"
default[:opencds][:deploy_knowledge_repo][:properties_dir] = "#{node[:tomcat][:user_home]}/.opencds"

# DEPLOY_CDS_ENGINE_AGENT:
default[:opencds][:deploy_cds_engine_agent][:app_name] = "cds-engine-agent"
default[:opencds][:deploy_cds_engine_agent][:app_dir] = "#{node[:tomcat][:webapp_dir]}/#{node[:opencds][:deploy_cds_engine_agent][:app_name]}"
default[:opencds][:deploy_cds_engine_agent][:deployed_war_file] = "#{node[:tomcat][:webapp_dir]}/#{node[:opencds][:deploy_cds_engine_agent][:app_name]}.war"
default[:opencds][:deploy_cds_engine_agent][:downloaded_war_file] = "#{Chef::Config[:file_cache_path]}/#{node[:opencds][:deploy_cds_engine_agent][:app_name]}.war"
