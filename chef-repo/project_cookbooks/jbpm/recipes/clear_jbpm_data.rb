#
# Cookbook Name:: jbpm
# Recipe:: clear_jbpm_data
#

include_recipe "jbpm::set_oracle_env"

sys_password = data_bag_item("credentials", "oracle_user_sys", node['data_bag_string'])["password"]
oracle_node = find_optional_node_by_role("ehmp_oracle", node[:stack])
oracle_ip = oracle_node[:ipaddress] if !oracle_node.nil?
oracle_port = oracle_node[:ehmp_oracle][:oracle_config][:port] if !oracle_node.nil?
oracle_sid = oracle_node[:ehmp_oracle][:oracle_sid] if !oracle_node.nil?

cookbook_file "#{node[:jbpm][:workdir]}/clear_jbpm_data.sql"

execute "clear jbpm data" do
  cwd node[:jbpm][:workdir]
  command "sqlplus -s /nolog <<-EOF>> #{node[:jbpm][:workdir]}/clear_jbpm_data.log
    WHENEVER OSERROR EXIT 9;
    WHENEVER SQLERROR EXIT SQL.SQLCODE;
    connect sys/#{sys_password} as sysdba
    @clear_jbpm_data.sql
    EXIT
  EOF"
end
