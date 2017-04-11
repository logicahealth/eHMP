use_inline_resources

action :generate do 

	unless ::File.exist?(node[:cdsdb][:ssl_pem_key_file])

		raise "Failing due to an attempt to generate a dev cert on a non-dev machine" unless node[:cdsdb][:dev_cdsdb]

		file "#{node[:cdsdb][:ssl_dir]}/rootCA.key" do
			action :create
			content lazy {
				Chef::EncryptedDataBagItem.load("mongo", "root_ca_key", node[:data_bag_string])["content"].join("\n")
			}
			mode '0444'
			owner 'root'
		end

		cookbook_file "#{node[:cdsdb][:ssl_dir]}/openssl-ca.cnf" do
		  owner 'root'
		  group 'root'
		  mode '0644'
		end

		cookbook_file "#{node[:cdsdb][:ssl_dir]}/openssl-server.cnf" do
		  owner 'root'
		  group 'root'
		  mode '0644'
		end

		file "#{node[:cdsdb][:ssl_dir]}/index.txt" do
			owner 'root'
		  group 'root'
		  mode '0644'
		  content "01"
		end 

		file "#{node[:cdsdb][:ssl_dir]}/serial.txt" do
			owner 'root'
		  group 'root'
		  mode '0644'
		  content "01"
		end 

		execute "create_csr_and_key" do
			command "openssl req -config openssl-server.cnf -nodes -newkey rsa:2048 -sha256 -keyout server.key -out server.csr -outform PEM -subj \"/C=US/O=VistA Core/OU=VistA Core Dev Internal/CN=#{node[:ipaddress]}\""
			cwd node[:cdsdb][:ssl_dir]
			environment ( 
				{'IP' => node[:ipaddress], 
				'SAN' => "IP:#{node[:ipaddress]}"}
			)
		end

		execute "sign_csr" do
			command "openssl ca -batch -config openssl-ca.cnf -policy signing_policy -extensions signing_req -out server.crt -infiles server.csr"
			cwd node[:cdsdb][:ssl_dir]
		end

		execute "cat_key_and_crt_to_pem" do
			command "cat server.key server.crt > server.pem"
			cwd node[:cdsdb][:ssl_dir]
		end

		[
			"#{node[:cdsdb][:ssl_dir]}/server.csr",
			"#{node[:cdsdb][:ssl_dir]}/server.key",
			"#{node[:cdsdb][:ssl_dir]}/server.crt",
			"#{node[:cdsdb][:ssl_dir]}/rootCA.key"
		].each do |file_to_remove|
			file "remove_#{file_to_remove}" do
				path file_to_remove
				action :delete
			end
		end

		new_resource.updated_by_last_action(true)

	end

end
	1