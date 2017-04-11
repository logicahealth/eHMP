include_recipe "ark"

jboss_user = node['jboss-eap']['jboss_user']
jboss_group = node['jboss-eap']['jboss_group']

# Create JBoss User
user node['jboss-eap']['jboss_user'] do
	action :create
end

# Grab and unpack jboss package
ark node['jboss-eap']['symlink'] do
	url node['jboss-eap']['package_url']
	checksum node['jboss-eap']['checksum']
	version node['jboss-eap']['version']
	prefix_root node['jboss-eap']['install_path']
	prefix_home node['jboss-eap']['install_path']
	owner node['jboss-eap']['jboss_user']
	group node['jboss-eap']['jboss_group']
	action :install
end


# Init script config dir
directory node['jboss-eap']['config_dir'] do
	owner 'root'
	group 'root'
	mode "0755"
end

# Init script config file
template "#{node['jboss-eap']['config_dir']}/jboss-as.conf" do
  source    'jboss-as.conf.erb'
  owner 'root'
  group 'root'
  mode "0644"
end

# Init script
cookbook_file "/etc/init.d/jboss" do
  source "jboss-as-standalone-init.sh"
  mode "0755"
  owner "root"
  group "root"
end

# Manage log directory
default_log_dir = "#{node['jboss-eap']['jboss_home']}/standalone/log"

# Delete default log directory if it's not a symlink and not the same as the specified log_dir
directory default_log_dir do
	action :delete
	not_if { node['jboss-eap']['log_dir'] == default_log_dir }
	not_if "test -L #{default_log_dir}"
end

# Create log directory
directory node['jboss-eap']['log_dir'] do
	owner node['jboss-eap']['jboss_user']
	group node['jboss-eap']['jboss_group']
	mode "2775"
end

# Log directory symlink
link default_log_dir do
	to node['jboss-eap']['log_dir']
	owner node['jboss-eap']['jboss_user']
	group node['jboss-eap']['jboss_group']
	not_if { node['jboss-eap']['log_dir'] == default_log_dir }
end


# Add admin user if the user is not found in mgmt-users.properties
if node['jboss-eap']['admin_user'] && node['jboss-eap']['admin_passwd']
	execute "add_admin_user" do
		command "#{node['jboss-eap']['jboss_home']}/bin/add-user.sh --silent -u #{node['jboss-eap']['admin_user']} -p #{node['jboss-eap']['admin_passwd']}"
		not_if "grep ^#{node['jboss-eap']['admin_user']} #{node['jboss-eap']['jboss_home']}/standalone/configuration/mgmt-users.properties"
	end
end



# Enable service on boot if requested
service "jboss" do
	if node['jboss-eap']['start_on_boot']
		action :enable
	else
		action :disable
	end
end
