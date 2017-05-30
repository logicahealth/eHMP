use_inline_resources

action :execute do

	datasource_password = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", node[:data_bag_string])["password"]
	mssql_password = Chef::EncryptedDataBagItem.load("jbpm", "sql_users_password", node[:data_bag_string])["mssql_password"]
	pcmm_file = "/tmp/create_jbpm_pcmm_schema.sql"

	template pcmm_file do
	  variables(
	    :mssql_password => mssql_password,
	    :mssql_username => node['ehmp_oracle']['oracle_config']['mssql_username'],
	    :refresh_view_minutes => node['ehmp_oracle']['oracle_config']['refresh_view_minutes']
	  )
	  sensitive true
	end

	execute "Create_pcmm_from_sql_file" do
		cwd "/tmp"
		command "echo exit | sqlplus sys/#{datasource_password} as sysdba@connect @#{pcmm_file}"
		sensitive true

	end

	new_resource.updated_by_last_action(true)

end
