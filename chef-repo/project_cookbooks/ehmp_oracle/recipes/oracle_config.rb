#
# Cookbook Name:: ehmp_oracle
# Recipe:: oracle_config
#

execute "wait for listener to be ready" do
  command 'lsnrctl status | grep \'STATUS of the LISTENER\''
  retries 5
end

ehmp_oracle_users "create_users"
ehmp_oracle_pcmm "create_pcmm"

remote_file "#{Chef::Config.file_cache_path}/sql_config.tgz" do
  use_conditional_get true
  source node['oracle_sql_config_artifacts']['source']
  mode   "0755"
  notifies :delete, "directory[#{node['ehmp_oracle']['oracle_config']['sql_config_dir']}]", :immediately
end

directory node['ehmp_oracle']['oracle_config']['sql_config_dir'] do
  owner  'root'
  group  'root'
  mode "0755"
  recursive true
  action :create
end

execute "extract_sql_config.tgz" do
  cwd node['ehmp_oracle']['oracle_config']['sql_config_dir']
  command "tar -zxvf #{Chef::Config.file_cache_path}/sql_config.tgz"
  notifies :execute, "ehmp_oracle_sql_config[configure_sql]", :immediately
  only_if { (Dir.entries(node['ehmp_oracle']['oracle_config']['sql_config_dir']) - %w{ . .. }).empty? }
end

ehmp_oracle_sql_config "configure_sql" do
  config_dir node['ehmp_oracle']['oracle_config']['sql_config_dir']
  action :nothing
end
