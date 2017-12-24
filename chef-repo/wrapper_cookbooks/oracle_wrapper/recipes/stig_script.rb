#
# Cookbook Name:: oracle_wrapper
# Recipe:: stig_script
#

sys_password = data_bag_item("credentials", "oracle_user_sys", node[:data_bag_string])["password"]
stig_script_password = data_bag_item("oracle", "stig_script_password", node[:data_bag_string])["password"]

stig_script = "#{node[:oracle][:rdbms][:ora_home_12c]}/STIG_script.sql"

template stig_script do
  source "STIG_script.sql.erb"
  owner 'oracle'
  group 'dba'
  mode '0755'
  variables(
    :password => stig_script_password
  )
end

execute "run stig script" do
  command "sudo -Eu oracle PATH=$PATH echo exit | #{node[:oracle][:rdbms][:ora_home_12c]}/bin/sqlplus sys/#{sys_password} as sysdba@connect @#{stig_script}"
  sensitive true
end

service 'restart oracle' do
	service_name 'oracle'
	action :restart
end
