#
# Cookbook Name:: oracle-xe_wrapper
# Recipe:: gateway_config
#

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
  notifies :run, "execute[chown #{node[node['ehmp_oracle']['oracle_service']]['base']}]", :immediately
  notifies :run, 'execute[provision_gateway]', :immediately
  notifies :create, "template[#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['home']}/gateways/dg4msql/admin/initdg4ehmp.ora]", :immediately
  notifies :run, "execute[insert_#{node['ehmp_oracle']['oracle_service']}_listener]", :immediately
  notifies :run, 'execute[insert tnsnames]', :immediately
  notifies :run, "execute[reset_permissions]", :immediately
  notifies :run, 'execute[cycle_lsnrctl]', :immediately
  only_if { (Dir.entries(node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['config_dir']) - %w{ . .. }).empty? }
end

mssql = find_optional_node_by_role("pcmmdb", node[:stack]) || data_bag_item('servers', 'pcmmdb').to_hash

template "#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['config_dir']}/gateways/response/tg4msql.rsp" do
	source "oracle-xe_tg4msql.rsp.erb"
	owner 'oracle'
	group node[node['ehmp_oracle']['oracle_service']]['group']
	variables(
		:oracle_home => "#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['home']}/gateways",
		:oracle_base => node["#{node['ehmp_oracle']['oracle_service']}"]['base'],
    :oracle_group => node[node['ehmp_oracle']['oracle_service']]['group'],
    :mssql => mssql
	)
	action :nothing
end

template "#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['home']}/gateways/dg4msql/admin/initdg4#{node['ehmp_oracle']['mssql_database']}.ora" do
	source "oracle_initdg4.ora.erb"
	owner 'oracle'
	group node[node['ehmp_oracle']['oracle_service']]['group']
	variables(
		:mssql => mssql
	)
	action :nothing
end

# change ownership of /oracle directory to oracle user recursively.
# this mostly changes the ownership of /oracle/product from root to oracle user.
execute "chown #{node[node['ehmp_oracle']['oracle_service']]['base']}" do
  command "chown -R oracle:#{node[node['ehmp_oracle']['oracle_service']]['group']} #{node[node['ehmp_oracle']['oracle_service']]['base']}/"
  action :nothing
end

execute "provision_gateway" do
	cwd "#{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['config_dir']}/gateways"
	command "sudo -Eu oracle #{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['config_dir']}/gateways/runInstaller -silent -waitforcompletion -noconfig -responseFile #{node[node['ehmp_oracle']['oracle_service']]['oracle_gateway']['config_dir']}/gateways/response/tg4msql.rsp -invPtrLoc #{node[node['ehmp_oracle']['oracle_service']]['base']}/oraInst.loc"
	action :nothing
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
    (ADDRESS=(PROTOCOL=tcp)(HOST=localhost)(PORT=1521))\\
    (CONNECT_DATA=(SID=#{SID_NAME}))\\
    (HS=OK)\\
  )"


ruby_block "insert_listeners" do
  notifies :run, "execute[insert_#{node['ehmp_oracle']['oracle_service']}_listener]", :immediately
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

execute "reset_permissions" do
	command "chmod 6751 #{node[node['ehmp_oracle']['oracle_service']]['home']}/bin/oracle;"
	action :nothing
end
