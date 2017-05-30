action :execute do

	datasource_password = Chef::EncryptedDataBagItem.load("oracle", "oracle_password", node[:data_bag_string])["password"]
	sql_order = JSON.parse(IO.read("#{new_resource.config_dir}/sql_order.json"))["sql_order"]

	sql_order.each do |file|

		execute "Create_#{file}_schema" do
			cwd new_resource.config_dir
			command "echo exit | sqlplus sys/#{datasource_password} as sysdba@connect @#{file}"
			sensitive true

		end
	end

end
