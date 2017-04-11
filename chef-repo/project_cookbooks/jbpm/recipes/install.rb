#
# Cookbook Name:: jbpm
# Recipe:: default
#

include_recipe "jboss-eap_wrapper"

admin_password = Chef::EncryptedDataBagItem.load("credentials", "jbpm_admin_password", node[:data_bag_string])["password"]

template "#{Chef::Config[:file_cache_path]}/jbpm.auto.xml" do
  source "jbpm.auto.xml.erb"
  mode "0755"
  variables(:admin_password => admin_password)
end

remote_file "#{Chef::Config['file_cache_path']}/jboss-bpmsuite-6.1.0.GA-installer.jar" do
  source node[:jbpm][:install][:source]
  mode   "0755"
  use_conditional_get true
  action :create_if_missing
end

template "#{Chef::Config[:file_cache_path]}/niogit_config.xml"
template "#{Chef::Config[:file_cache_path]}/set_bind_address.xml"

execute "Check if jBPM is installed" do
  command 'echo "jBPM is not installed"'
  notifies :stop, "service[jboss]", :immediately
  notifies :run, "execute[Install jBPM]", :immediately
  not_if { ::File.exist?("#{node[:jbpm][:home]}/deployments/kie-server.war") }
end

execute "Install jBPM" do
  command "java -jar #{Chef::Config[:file_cache_path]}/jboss-bpmsuite-6.1.0.GA-installer.jar #{Chef::Config[:file_cache_path]}/jbpm.auto.xml"
  cwd "#{Chef::Config['file_cache_path']}"
  user node['jboss-eap'][:jboss_user]
  action :nothing
  notifies :start, "service[jboss]", :immediately
end

directory "#{node['jbpm']['gitdir']}/.niogit" do
  owner node['jboss-eap'][:jboss_user]
  mode "0777"
  recursive true
end

# Using sed to insert lines in the configuration file, since the file is modified by the jbpm installation and therefore can't be a template
execute "Set configuration for niogit in standalone.xml" do
  command "sed -i '/<system-properties>/r niogit_config.xml' #{node[:jbpm][:home]}/configuration/standalone.xml"
  cwd "#{Chef::Config[:file_cache_path]}"
  not_if "grep org.uberfire.nio.git.dir #{node[:jbpm][:home]}/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :immediately
end

execute "Set bind address in standalone.xml" do
  command "sed -i '/<system-properties>/r set_bind_address.xml' #{node['jboss-eap']['install_path']}/#{node['jboss-eap']['symlink']}/standalone/configuration/standalone.xml"
  cwd "#{Chef::Config[:file_cache_path]}"
  not_if "grep 0.0.0.0 #{node['jboss-eap']['install_path']}/#{node['jboss-eap']['symlink']}/standalone/configuration/standalone.xml"
  notifies :stop, "service[jboss]", :immediately
end

logrotate_app "jboss_server_logs" do
  path "#{node['jboss-eap']['log_dir']}/server.log.????-??-??"
  enable true
  frequency "daily"
  lastaction [" # Remove rotated files older than 7 days
    find #{node['jboss-eap']['log_dir']} -name 'server.log.????-??-??' -mtime +7 -exec rm {} \;"]
end

logrotate_app "jboss_console_logs" do
  path "#{node['jboss-eap']['log_dir']}/console.log"
  enable true
  rotate "7"
  frequency "daily"
  dateformat ".%Y-%m-%d"
end
