#
# Cookbook Name:: jds
# Recipe:: cache
#

current_cache_version = `ccontrol qlist | grep running | cut -d"^" -f3`.strip.gsub('.','')
current_service_name = `chkconfig --list | grep cache | grep on | cut -d$'\t' -f1`.strip
current_instance_name = `ccontrol qlist | grep running | cut -d^ -f1`.strip.downcase
raise "Multiple cache services are enabled. This is not a supported configuration" if current_service_name.lines.count > 1
raise "Multiple cache instances are running. This is not a supported configuration" if current_instance_name.lines.count > 1 || current_cache_version.lines.count > 1

# Stop and disable old instance since we want a side-by-side install
if !current_service_name.nil? && !current_service_name.empty?
  service current_service_name do
    action :nothing
  end
end

execute "Change instance name of old cache" do
  command "ccontrol rename #{current_instance_name} cache#{current_cache_version}"
  action :nothing
  not_if { current_instance_name == "cache#{current_cache_version}" || current_instance_name.empty?}
end

# Create init script for cache instance
template "/etc/init.d/#{node[:jds][:service_name]}" do
  source 'cache_initd.erb'
  owner 'root'
  group 'root'
  mode '0755'
  variables(
    :cache_dir => node[:jds][:cache_dir],
    :cache_service => node[:jds][:instance_name]
  )
end

# Create the cache service
service node[:jds][:service_name] do
  supports :restart => true
  action :nothing
end

# Create directory used to unpack the tarball
directory node[:jds][:installer_dir] do
  mode "0755"
  recursive true
  action :nothing
end

# Create destination installation directory
directory node[:jds][:cache_dir] do
  mode "0755"
  action :create
end

# Create user that is used to install and own the cache instance
user node[:jds][:cache_user] do
  action :create
end

# Copy cache tarball to installation directory
remote_file "#{node[:jds][:installer_dir]}/cache.tar.gz" do
  notifies :delete, "directory[#{node[:jds][:installer_dir]}]", :before
  notifies :create, "directory[#{node[:jds][:installer_dir]}]", :before
  source node[:jds][:cache_source]
end

# Copy JDS source code
file "#{node[:jds][:cache_dir]}/jds.ro" do
  action :nothing
end

directory node[:jds][:jds_data][:dir] do
  action :nothing
end

execute "extract cache tar" do
  cwd node[:jds][:installer_dir]
  command "tar -xzf cache.tar.gz"
  not_if {`ccontrol qlist | grep #{node[:jds][:instance_name].upcase}^#{node[:jds][:cache_dir]}^#{node[:jds][:cache_install_version]}^`.include?(node[:jds][:instance_name].upcase)}
end

cache_parameter = {
  'ISC_PACKAGE_INITIAL_SECURITY'=>"#{node[:jds][:cache_install_type]}",
  'ISC_PACKAGE_MGRUSER'=>"#{node[:jds][:cache_user]}",
  'ISC_PACKAGE_MGRGROUP'=>"#{node[:jds][:cache_user]}",
  'ISC_PACKAGE_USER_PASSWORD'=> Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["user_password"],
  'ISC_PACKAGE_INSTANCENAME'=>"#{node[:jds][:instance_name]}",
  'ISC_PACKAGE_INSTALLDIR'=>"#{node[:jds][:cache_dir]}",
  'ISC_PACKAGE_CACHEUSER'=>"#{node[:jds][:cache_user]}",
  'ISC_PACKAGE_CACHEGROUP'=>"#{node[:jds][:cache_user]}",
  'ISC_PACKAGE_UNICODE'=>"Y"
}

# Insert CSP password into cache_parameter if it exists
csp_password = Chef::EncryptedDataBagItem.load("credentials", "jds_passwords", node[:data_bag_string])["csp_password"]
if csp_password != nil
  cache_parameter['ISC_PACKAGE_CSPSYSTEM_PASSWORD'] = csp_password
end

# make ownership cacheserver
execute "correct_ownership_of_cache_home" do
  command "chgrp -R #{node[:jds][:cache_user]} #{node[:jds][:cache_dir]}"
  action :run
end

execute "install cache tar" do
  cwd node[:jds][:installer_dir]
  command "./cinstall_silent"
  environment cache_parameter
  notifies :run, "execute[Change instance name of old cache]", :before 
  notifies :stop, "service[#{current_service_name}]", :before if !current_service_name.nil? && !current_service_name.empty?
  notifies :disable, "service[#{current_service_name}]", :before if !current_service_name.nil? && !current_service_name.empty?
  notifies :enable, "service[#{node[:jds][:service_name]}]", :before
  notifies :delete, "file[#{node[:jds][:cache_dir]}/jds.ro]", "immediately"
  notifies :delete, "directory[#{node[:jds][:jds_data][:dir]}]", "immediately"
  not_if {`ccontrol qlist | grep #{node[:jds][:instance_name].upcase}^#{node[:jds][:cache_dir]}^#{node[:jds][:cache_install_version]}^`.include?(node[:jds][:instance_name].upcase)}
end

execute "update cpf config" do
  cwd node[:jds][:cache_dir]
  command "sed -i 's/WebServer=1/WebServer=0/' cache.cpf"
  notifies :restart, "service[#{node[:jds][:service_name]}]", :immediately
  only_if "grep \"WebServer=1\" #{node[:jds][:cache_dir]}/cache.cpf"
end
