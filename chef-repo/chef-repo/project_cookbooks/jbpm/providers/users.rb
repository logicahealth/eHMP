use_inline_resources 

action :execute do

 	datasource_password = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", node[:data_bag_string])["password"]
	sql_users = Chef::EncryptedDataBagItem.load("jbpm", "sql_users_password", node[:data_bag_string])
	jbpm_password = sql_users["jbpm_password"]
	activitydb_password = sql_users["activitydb_password"]
	activitydbuser_password = sql_users["activitydbuser_password"]
	notifdb_password = sql_users["notifdb_password"]
	pcmm_password = sql_users["pcmm_password"]
	sdsadm_password = sql_users["sdsadm_password"]
 	user_file = "/tmp/sql_users.sql"

 	template user_file do
 	  variables(
	    :jbpm_password => jbpm_password,
	    :jbpm_username => node['jbpm']['sql_users']['jbpm_username'],
	    :activitydb_password => activitydb_password,
	    :activitydb_username => node['jbpm']['sql_users']['activitydb_username'],
	    :activitydbuser_password => activitydbuser_password,
	    :activitydbuser_username => node['jbpm']['sql_users']['activitydbuser_username'],
	    :notifdb_password => notifdb_password,
	    :notifdb_username => node['jbpm']['sql_users']['notifdb_username'],
		:pcmm_password => pcmm_password,
	    :pcmm_username => node['jbpm']['sql_users']['pcmm_username'],
		:sdsadm_password => sdsadm_password,
		:sdsadm_username => node['jbpm']['sql_users']['sdsadm_username']
 	  )
	  sensitive true
 	end

 	execute "Create_users_from_sql_file" do
 		cwd "/tmp"
 		command "sudo -Eu oracle PATH=$PATH echo exit | sqlplus sys/#{datasource_password} as sysdba@connect @#{user_file}"
 		sensitive true
 	end

 	new_resource.updated_by_last_action(true)

end

