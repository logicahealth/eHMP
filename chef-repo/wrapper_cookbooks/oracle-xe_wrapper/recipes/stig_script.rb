#
# Cookbook Name:: oracle-xe_wrapper
# Recipe:: stig_script
#

datasource_password = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", node[:data_bag_string])["password"]
stig_script_password = Chef::EncryptedDataBagItem.load("oracle", "stig_script_password", node[:data_bag_string])["password"]

stig_script = "/u01/app/oracle/STIG_script.sql"

template stig_script do
  source "STIG_script.sql.erb"
  mode "0755"
  variables(
    :password => stig_script_password
  )
end

execute "run stig script" do
  command "sudo -Eu oracle PATH=$PATH echo exit | sqlplus sys/#{datasource_password} as sysdba@connect @#{stig_script}"
  sensitive true
end
