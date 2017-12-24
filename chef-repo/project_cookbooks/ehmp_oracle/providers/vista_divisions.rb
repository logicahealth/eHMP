#
# Cookbook:: ehmp_oracle
# Resource:: vista_divisions
#
# Writes vista divions to csv
#

def get_vista_divisions
	vistas = find_multiple_nodes_by_role("vista-.*", node[:stack])
	vista_sites = []

	vistas.each_with_index do |site, index|
		site["vista"]["division"].each do |div|
			vista_sites.push(div["id"] + ","  + div["name"] + ","  + site["vista"]["site_id"])
		end
	end
	return vista_sites.join("\n")
end

action :execute do

	directory node['ehmp_oracle']['oracle_config']['utils_tmp_dir'] do
	  owner  'root'
	  group  'root'
	  mode '0755'
	  recursive true
	  action :create
	end

	file "#{node['ehmp_oracle']['oracle_config']['utils_tmp_dir']}/vista_sites.csv" do
		content get_vista_divisions
		mode '0644'
		owner 'root'
		group 'root'
	end
	ehmp_user_item = data_bag_item("credentials", "oracle_user_ehmp", node[:data_bag_string])

	execute "insert vista divisions" do
	  cwd node['ehmp_oracle']['oracle_config']['utils_dir']
	  command "sqlldr userid=#{ehmp_user_item['username']}/#{ehmp_user_item['password']} control=#{node['ehmp_oracle']['oracle_config']['utils_dir']}/load_divisions.ctl"
	  sensitive true
	end
end