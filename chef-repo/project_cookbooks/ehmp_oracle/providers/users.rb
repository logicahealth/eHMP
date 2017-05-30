use_inline_resources

action :execute do

  datasource_password = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", node[:data_bag_string])["password"]
  sql_users = Chef::EncryptedDataBagItem.load("jbpm", "sql_users_password", node[:data_bag_string])
  user_file = "/tmp/sql_users.sql"

  template user_file do
    variables(
      :jbpm_password => sql_users['jbpm_password'],
      :jbpm_username => node['ehmp_oracle']['oracle_config']['jbpm_username'],
      :activitydb_password => sql_users['activitydb_password'],
      :activitydb_username => node['ehmp_oracle']['oracle_config']['activitydb_username'],
      :activitydbuser_password => sql_users['activitydbuser_password'],
      :activitydbuser_username => node['ehmp_oracle']['oracle_config']['activitydbuser_username'],
      :notifdb_password => sql_users['notifdb_password'],
      :notifdb_username => node['ehmp_oracle']['oracle_config']['notifdb_username'],
      :pcmm_password => sql_users['pcmm_password'],
      :pcmm_username => node['ehmp_oracle']['oracle_config']['pcmm_username'],
      :sdsadm_password => sql_users['sdsadm_password'],
      :sdsadm_username => node['ehmp_oracle']['oracle_config']['sdsadm_username']
 	  )
	  sensitive true
 	end

  execute "Create_users_from_sql_file" do
    cwd "/tmp"
    command "echo exit | sqlplus sys/#{datasource_password} as sysdba@connect @#{user_file}"
    sensitive true
  end

  new_resource.updated_by_last_action(true)

end
