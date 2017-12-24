#
# Cookbook Name:: ehmp_oracle
# Recipe:: oracle_config
#

sql_config_dir = node['ehmp_oracle']['oracle_config']['sql_config_dir']
sql_dir = node['ehmp_oracle']['oracle_config']['sql_dir']

execute "wait for listener to be ready" do
  environment(node['oracle_wrapper']['oracle_env'])
  command 'lsnrctl status | grep \'STATUS of the LISTENER\''
  retries 5
end

directory sql_dir do
  owner  'oracle'
  group  'oinstall'
  mode "0755"
  recursive true
  action :create
end

directory node['ehmp_oracle']['oracle_config']['log_dir'] do
  owner  'oracle'
  group  'oinstall'
  mode "0755"
  recursive true
  action :create
end

sys_password = data_bag_item("credentials", "oracle_user_sys", node[:data_bag_string])["password"]

#
# create_tablespaces
#

tablespace_install_file = "#{sql_dir}/create_tablespaces.sql"

template tablespace_install_file do
  variables(
    :tablespaces => node['ehmp_oracle']['oracle_config']['tablespaces']
  )
  notifies :delete, "file[tablespaces_installed]", :immediately
  sensitive true
end

ehmp_oracle_sqlplus "create_tablespaces" do
  install_file tablespace_install_file
  connect_string "sys/#{sys_password} as sysdba"
  action :execute
  not_if { ::File.exist? "#{tablespace_install_file}.success" }
  sensitive true
end

file "tablespaces_installed" do
  path "#{tablespace_install_file}.success"
  action :nothing
end

#
# create_users
#

user_install_file = "#{sql_dir}/create_users.sql"
user_config = {}

node['ehmp_oracle']['oracle_config']['users'].each do |name, properties|
  data_bag = properties['data_bag'] || "credentials"
  data_bag_item = properties['data_bag_item'] || "oracle_user_#{name}"
  data_bag_password_attr = properties['data_bag_password_attr'] || "password"
  data_bag_username_attr = properties['data_bag_username_attr'] || "username"
  password = data_bag_item(data_bag, data_bag_item, node[:data_bag_string])[data_bag_password_attr]
  username = data_bag_item(data_bag, data_bag_item, node[:data_bag_string])[data_bag_username_attr] || name
  user_config[name] = {
    "username" => username,
    "password" => password,
    "tablespace" => properties['tablespace'],
    "index_tablespace" => properties['index_tablespace'],
    "user_type" => properties['user_type'],
    "deprecate" => properties['deprecate']
  }
end

template user_install_file do
  variables(
    :users => user_config
  )
  notifies :delete, "file[users_installed]", :immediately
  sensitive true
end

ehmp_oracle_sqlplus "create_users" do
  install_file user_install_file
  connect_string "sys/#{sys_password} as sysdba"
  action :execute
  not_if { ::File.exist? "#{user_install_file}.success" }
  sensitive true
end

file "users_installed" do
  path "#{user_install_file}.success"
  action :nothing
end

#
# create_pcmm
#

mssql_username = data_bag_item("credentials", "mssql_user_oracleuser", node[:data_bag_string])["username"]
mssql_password = data_bag_item("credentials", "mssql_user_oracleuser", node[:data_bag_string])["password"]
mssql_pcmm_install_file = "#{sql_dir}/create_jbpm_pcmm_schema.sql"

template mssql_pcmm_install_file do
  variables(
    :mssql_password => mssql_password,
    :mssql_username => mssql_username,
    :refresh_view_minutes => node['ehmp_oracle']['oracle_config']['refresh_view_minutes'],
    :replicate_pcmm_schedule_repeat_interval => node['ehmp_oracle']['oracle_config']['replicate_pcmm_schedule_repeat_interval']
  )
  mode "0755"
  notifies :delete, "file[mssql_pcmm_installed]", :immediately
  sensitive true
end

ehmp_oracle_sqlplus "create_pcmm" do
  install_file mssql_pcmm_install_file
  connect_string "sys/#{sys_password} as sysdba"
  action :execute
  not_if { ::File.exist? "#{mssql_pcmm_install_file}.success" }
  sensitive true
end

file "mssql_pcmm_installed" do
  path "#{mssql_pcmm_install_file}.success"
  action :nothing
end

#
# sql_config
#

remote_file "#{Chef::Config.file_cache_path}/sql_config.tgz" do
  use_conditional_get true
  source node['oracle_sql_config_artifacts']['source']
  mode   "0755"
  notifies :delete, "directory[#{sql_config_dir}]", :immediately
end

directory sql_config_dir do
  owner  'root'
  group  'root'
  mode "0755"
  recursive true
  action :create
end

execute "extract_sql_config.tgz" do
  cwd sql_config_dir
  command "tar -zxvf #{Chef::Config.file_cache_path}/sql_config.tgz"
  notifies :execute, "ehmp_oracle_sql_config[configure_sql]", :immediately
  only_if { (Dir.entries(sql_config_dir) - %w{ . .. }).empty? }
end

ehmp_oracle_sql_config "configure_sql" do
  config_dir sql_config_dir
  action :nothing
end

#
# install_communication_schema
#

communication_user = data_bag_item("credentials", "oracle_user_communication", node['data_bag_string'])
communication_install_file = "#{sql_dir}/communication/install.sql"

remote_directory "#{sql_dir}/communication" do
  source "oracledb/communication"
  mode "0755"
  notifies :delete, "file[communication_installed]", :immediately
end

ehmp_oracle_sqlplus "install_communication_schema" do
  install_file communication_install_file
  connect_string "#{communication_user['username']}/#{communication_user['password']}"
  action :execute
  not_if { ::File.exist? "#{communication_install_file}.success" }
  sensitive true
end

file "communication_installed" do
  path "#{communication_install_file}.success"
  action :nothing
end

#
# install_ehmp_schema
#

ehmp_user = data_bag_item("credentials", "oracle_user_ehmp", node['data_bag_string'])
ehmp_install_file = "#{sql_dir}/ehmp/install.sql"

remote_directory "#{sql_dir}/ehmp" do
  source "oracledb/ehmp"
  mode "0755"
  notifies :delete, "file[ehmp_installed]", :immediately
end

ehmp_oracle_sqlplus "install_ehmp_schema" do
  install_file ehmp_install_file
  connect_string "#{ehmp_user['username']}/#{ehmp_user['password']}"
  action :execute
  not_if { ::File.exist? "#{ehmp_install_file}.success" }
  sensitive true
end

file "ehmp_installed" do
  path "#{ehmp_install_file}.success"
  action :nothing
end

#
# install_sdsadm_schema
#

sdsadm_username = data_bag_item("credentials", "oracle_user_sdsadm", node[:data_bag_string])["username"]
sdsadm_password = data_bag_item("credentials", "oracle_user_sdsadm", node[:data_bag_string])["password"]
sdsadm_install_file = "#{sql_dir}/sdsadm/install.sql"

remote_directory "#{sql_dir}/sdsadm" do
  source "oracledb/sdsadm"
  mode "0755"
  notifies :delete, "file[sdsadm_installed]", :immediately
end

ehmp_oracle_sqlplus "install_sdsadm_schema" do
  install_file sdsadm_install_file
  connect_string "#{sdsadm_username}/#{sdsadm_password}"
  action :execute
  not_if { ::File.exist? "#{sdsadm_install_file}.success" }
  sensitive true
end

file "sdsadm_installed" do
  path "#{sdsadm_install_file}.success"
  action :nothing
end

#
# install_pcmm_schema
#

pcmm_install_file = "#{sql_dir}/pcmm/install.sql"

remote_directory "#{sql_dir}/pcmm" do
  source "oracledb/pcmm"
  mode "0755"
  notifies :delete, "file[pcmm_installed]", :immediately
end

ehmp_oracle_sqlplus "install_pcmm_schema" do
  install_file pcmm_install_file
  connect_string "sys/#{sys_password} as sysdba"
  action :execute
  not_if { ::File.exist? "#{pcmm_install_file}.success" }
  sensitive true
end

file "pcmm_installed" do
  path "#{pcmm_install_file}.success"
  action :nothing
end

#
# migrate_tablespaces
#

migrate_tablespaces_file = "#{sql_dir}/migrate_tablespaces.sql"

template migrate_tablespaces_file do
  variables(
    :users => user_config
  )
  notifies :delete, "file[migrate_tablespaces_installed]", :immediately
  sensitive true
end

ehmp_oracle_sqlplus "migrate_tablespaces" do
  install_file migrate_tablespaces_file
  connect_string "sys/#{sys_password} as sysdba"
  action :execute
  not_if { ::File.exist? "#{migrate_tablespaces_file}.success" }
  sensitive true
end

file "migrate_tablespaces_installed" do
  path "#{migrate_tablespaces_file}.success"
  action :nothing
end
