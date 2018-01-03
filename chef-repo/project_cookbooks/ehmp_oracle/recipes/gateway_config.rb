#
# Cookbook Name:: oracle-xe_wrapper
# Recipe:: gateway_config
#

mssql = find_optional_node_by_role("pcmmdb", node[:stack]) || data_bag_item('servers', 'pcmmdb').to_hash

execute 'cycle_lsnrctl' do
  command "export ORACLE_HOME=#{node[node['ehmp_oracle']['oracle_service']]['home']}; sudo -Eu oracle #{node[node['ehmp_oracle']['oracle_service']]['home']}/bin/lsnrctl stop; sudo -Eu oracle #{node[node['ehmp_oracle']['oracle_service']]['home']}/bin/lsnrctl start;"
  action :nothing
end

remote_file "#{Chef::Config.file_cache_path}/gateways.zip" do
  use_conditional_get true
  source node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['url']
  mode '755'
  notifies :delete, "directory[#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['config_dir']}]", :immediately
end

directory node['ehmp_oracle']['base_dir'] do
  owner 'oracle'
	group node[node['ehmp_oracle']['oracle_service']]['group']
  mode '755'
  recursive true
  action :create
end

directory node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['config_dir'] do
	owner 'oracle'
	group node[node['ehmp_oracle']['oracle_service']]['group']
	mode '755'
	recursive true
	action :create
end

execute "extract_gateways.zip" do
  cwd node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['config_dir']
  command "sudo -Eu oracle unzip -o #{Chef::Config.file_cache_path}/gateways.zip"
  notifies :create, "template[#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['config_dir']}/gateways/response/tg4msql.rsp]", :immediately
  notifies :run, 'execute[provision_gateway]', :immediately
  notifies :create, "template[#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['home']}/gateways/dg4msql/admin/initdg4ehmp.ora]", :immediately
  notifies :run, "execute[insert_#{node['ehmp_oracle']['oracle_service']}_listener]", :immediately
  notifies :run, 'execute[insert tnsnames]', :immediately
  notifies :run, 'execute[cycle_lsnrctl]', :immediately
  only_if { (Dir.entries(node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['config_dir']) - %w{ . .. }).empty? }
end


template "#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['config_dir']}/gateways/response/tg4msql.rsp" do
	owner 'oracle'
	group node[node['ehmp_oracle']['oracle_service']]['group']
	variables(
    :unix_group_name => "dba",
		:oracle_home => "#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['home']}/gateways",
    :mssql => mssql
	)
	action :nothing
end

template "#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['home']}/gateways/dg4msql/admin/initdg4ehmp.ora" do
	source "oracle_initdg4.ora.erb"
	owner 'oracle'
	group node[node['ehmp_oracle']['oracle_service']]['group']
	variables(
		:mssql => mssql
	)
  notifies :run, 'execute[cycle_lsnrctl]', :immediately
end

execute "provision_gateway" do
	cwd "#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['config_dir']}/gateways"
	command "sudo -Eu oracle #{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['config_dir']}/gateways/runInstaller -silent -waitforcompletion -noconfig -responseFile #{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['config_dir']}/gateways/response/tg4msql.rsp -invPtrLoc #{node[node['ehmp_oracle']['oracle_service']]['base']}/oraInst.loc"
	action :nothing
  notifies :run, "execute[stop_oracle]", :before
  notifies :run, "execute[start_oracle]", :immediately
  returns [0, 6]
end

SID_NAME = "dg4ehmp"

listener_oracle_xe = "\\
      (SID_DESC=\\
         (SID_NAME=#{SID_NAME})\\
         (ORACLE_HOME=#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['home']}/gateways)\\
         (ENVS=LD_LIBRARY_PATH=#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['home']}/gateways/dg4msql/driver/lib:#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['home']}/gateways/lib)\\
         (PROGRAM=dg4msql)\\
      )"

listener_oracle = "SID_LIST=(SID_DESC=(SID_NAME=#{SID_NAME})(ORACLE_HOME=#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['home']}/gateways)(ENVS=LD_LIBRARY_PATH=#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['home']}/gateways/dg4msql/driver/lib/:#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['home']}/gateways/lib)(PROGRAM=dg4msql))"

tnsnames = "\\
#{SID_NAME}  =\\
  (DESCRIPTION=\\
    (ADDRESS=(PROTOCOL=tcp)(HOST=localhost)(PORT=#{node['ehmp_oracle']['oracle_config']['port']}))\\
    (CONNECT_DATA=(SID=#{SID_NAME}))\\
    (HS=OK)\\
  )"


ruby_block "insert_listeners" do
  notifies :run, "execute[insert_#{node['ehmp_oracle']['oracle_service']}_listener]", :immediately
	action :nothing
end

execute 'start_oracle' do
  command "sudo service #{node['ehmp_oracle']['oracle_service']} start"
  action :nothing
end

execute 'stop_oracle' do
  command "sudo service #{node['ehmp_oracle']['oracle_service']} stop"
  action :nothing
end

execute "insert_oracle_listener" do
  cwd "#{node[node['ehmp_oracle']['oracle_service']]['home']}/network/admin"
  command "sudo -Eu oracle sed -i.orig 's|SID_LIST\=|#{listener_oracle}|' listener.ora"
  action :nothing
end

execute "insert_oracle-xe_listener" do
  cwd "#{node[node['ehmp_oracle']['oracle_service']]['home']}/network/admin"
  command "sudo -Eu oracle sed -i.orig '/SID_LIST \=/a #{listener_oracle_xe}' listener.ora"
  action :nothing
end

execute "insert tnsnames" do
	cwd "#{node[node['ehmp_oracle']['oracle_service']]['home']}/network/admin"
	command "sudo -Eu oracle sed -i.orig '$ a #{tnsnames}' tnsnames.ora"
	action :nothing
end
