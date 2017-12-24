#
# Cookbook:: ehmp_oracle
# Resource:: ehmp_routing_users
#
# Gets users from PJDS and filters them
#
def parse_uid(uid)
	return parsed_id = uid.split(":")
end

def get_users_and_filter
	jds = find_node_by_role("pjds", node[:stack], "jds")
	pjds_response = Chef::HTTP.new("http://#{jds['ipaddress']}:#{jds['jds']['cache_listener_ports']['general']}").get("/ehmpusers/")
	parsed_users = Chef::JSONCompat.parse(pjds_response)

	if (parsed_users["error"])
		puts "Error getting PJDS data"
	end

	filtered_users = []
	# Sort through each user and filter out users that have missing permissionSets
	parsed_users["items"].each do |users|
		if (users['permissionSet'].nil? != true && (users['permissionSet']['additionalPermissions'].nil? != true || users['permissionSet']['val'].nil? != true)  && users["uid"] && users["uid"] != '')
			parsed_user_id = parse_uid(users["uid"])
			filtered_users.push(users["uid"] + "," + parsed_user_id[4] + "," + parsed_user_id[3])
		end
	end
	return filtered_users.join("\n")
end

action :execute do

	directory node['ehmp_oracle']['oracle_config']['utils_tmp_dir'] do
	  owner  'root'
	  group  'root'
	  mode '0755'
	  recursive true
	  action :create
	end

	file "#{node['ehmp_oracle']['oracle_config']['utils_tmp_dir']}/provisioned_users.csv" do
		content get_users_and_filter
		mode '0644'
		owner 'root'
		group 'root'
	end

	ehmp_user_item = data_bag_item("credentials", "oracle_user_ehmp", node[:data_bag_string])

	execute "load provisioned users into routing staging" do
	  cwd "#{node['ehmp_oracle']['oracle_config']['utils_dir']}"
	  command "sqlldr userid=#{ehmp_user_item['username']}/#{ehmp_user_item['password']} control=#{node['ehmp_oracle']['oracle_config']['utils_dir']}/loadusers.ctl"
	  sensitive true
	end

	execute "move users from routing staging" do
	  command "sqlplus -s #{ehmp_user_item['username']}/#{ehmp_user_item['password']} <<-END>> #{node['ehmp_oracle']['oracle_config']['log_file']}
	  WHENEVER OSERROR EXIT 9;
	  WHENEVER SQLERROR EXIT SQL.SQLCODE;
	  execute EHMP_ROUTING_API.LOAD_USERS_FROM_STAGING();
	  exit;
	  END"
	  sensitive true
	end
end