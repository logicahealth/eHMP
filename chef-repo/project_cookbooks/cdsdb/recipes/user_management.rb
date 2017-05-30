#
# Cookbook Name:: cdsdb
# Recipe:: user_management
#

chef_gem 'mongo' do
	version '1.12.5'
end

mongodb_creds = Chef::EncryptedDataBagItem.load("credentials", node[:mongodb_creds_db] || "mongodb", node[:data_bag_string])

node.normal['mongodb']['admin'] = {
  'username' => mongodb_creds["admin"]["user"],
  'password' => mongodb_creds["admin"]["password"],
  'roles' => %w(userAdminAnyDatabase dbAdminAnyDatabase),
  'database' => 'admin'
}
node.normal['mongodb']['users'] = [{
	  'username' => mongodb_creds["cds"]["user"],
	  'password' => mongodb_creds["cds"]["password"],
	  'roles' => [{role:"readWrite",db: "_cds_agenda_"},{role:"readWrite",db:"engine"},{role:"readWrite",db:"intent"},{role:"readWrite",db:"metric"},{role:"readWrite",db:"patientlist"},{role:"readWrite",db:"schedule"},{role:"readWrite",db:"work"}],
	  'database' => 'admin'
	},
	{
	  'username' => mongodb_creds["rdk"]["user"],
	  'password' => mongodb_creds["rdk"]["password"],
	  'roles' => [{role:"readWrite",db: "_cds_agenda_"},{role:"readWrite",db:"engine"},{role:"readWrite",db:"intent"},{role:"readWrite",db:"metric"},{role:"readWrite",db:"patientlist"},{role:"readWrite",db:"schedule"},{role:"readWrite",db:"work"}],
	  'database' => 'admin'
	}]

mongodb_wrapper_confirm_connectable "confirm_connectable" do
	connection node['mongodb']
end

include_recipe "mongodb::user_management"
