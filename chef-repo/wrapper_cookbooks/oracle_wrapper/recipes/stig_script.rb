#
# Cookbook Name:: oracle_wrapper
# Recipe:: stig_script
#

datasource_password = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", node[:data_bag_string])["password"]
stig_script_password = Chef::EncryptedDataBagItem.load("oracle", "stig_script_password", node[:data_bag_string])["password"]

stig_script = "#{node[:oracle][:rdbms][:ora_home]}/STIG_script.sql"

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
  command "sudo -Eu oracle PATH=$PATH echo exit | #{node[:oracle][:rdbms][:ora_home]}/bin/sqlplus sys/#{datasource_password} as sysdba@connect @#{stig_script}"
  sensitive true
end

service 'restart oracle' do
	service_name 'oracle'
	action :restart
end
