use_inline_resources 

action :execute do 

	datasource_password = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", node[:data_bag_string])["password"]
	pcmm_replication_password = Chef::EncryptedDataBagItem.load("jbpm", "sql_users_password", node[:data_bag_string])["pcmm_replication_password"]

	user_file = "/tmp/sql_users.sql"
	template user_file do
	  variables(
	    :pcmm_replication_password => pcmm_replication_password,
	    :pcmm_username => "pcmm_replication"
	  )
	end

	execute "Create_users_from_sql_file" do
		cwd "/tmp"
		command "sudo -Eu oracle PATH=$PATH echo exit | sqlplus sys/#{datasource_password} as sysdba@connect @#{user_file}"
		sensitive true
	end

	new_resource.updated_by_last_action(true)

end
