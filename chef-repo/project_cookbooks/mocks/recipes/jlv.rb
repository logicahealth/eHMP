service "glassfish" do
  action :stop
end

# jlv webapp archive
remote_file "#{Chef::Config[:file_cache_path]}/#{node[:mocks][:jlv_name]}.war" do
  use_conditional_get true
  #checksum open("#{node[:mocks][:jlv_url]}.sha1", ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE).string
  action :create
  source node[:mocks][:jlv_url]
end

# old jlv webapp archive
remote_file "#{Chef::Config[:file_cache_path]}/#{node[:mocks][:jlv_old_name]}.war" do
  use_conditional_get true
  #checksum open("#{node[:mocks][:jlv_old_url]}.sha1", ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE).string
  action :create
  source node[:mocks][:jlv_old_url]
end

# Mock PDWS archive
remote_file "#{Chef::Config[:file_cache_path]}/#{node[:mocks][:pdws_name]}.war" do
  use_conditional_get true
  #checksum open("#{node[:mocks][:mock_pdws_url]}.sha1", ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE).string
  action :create
  source node[:mocks][:mock_pdws_url]
end

# Mock MVI archive
remote_file "#{Chef::Config[:file_cache_path]}/#{node[:mocks][:mvi_name]}.war" do
  use_conditional_get true
  #checksum open("#{node[:mocks][:mock_mvi_url]}.sha1", ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE).string
  action :create
  source node[:mocks][:mock_mvi_url]
end

execute "autodeploy JLV" do
  command "cp #{Chef::Config[:file_cache_path]}/#{node[:mocks][:jlv_name]}.war #{node[:mocks][:glassfish_autodeploy_dir]}"
  action :run
end

execute "autodeploy JLV_OLD" do
  command "cp #{Chef::Config[:file_cache_path]}/#{node[:mocks][:jlv_old_name]}.war #{node[:mocks][:glassfish_autodeploy_dir]}"
  action :run
end

execute "autodeploy Mock PDWS" do
  command "cp #{Chef::Config[:file_cache_path]}/#{node[:mocks][:pdws_name]}.war #{node[:mocks][:glassfish_autodeploy_dir]}"
  action :run
end

execute "autodeploy Mock MVI" do
  command "cp #{Chef::Config[:file_cache_path]}/#{node[:mocks][:mvi_name]}.war #{node[:mocks][:glassfish_autodeploy_dir]}"
  action :run
end

service "glassfish" do
  action :restart
end

# determine when all wars have deployed
jlv_wait_for_file "#{node[:mocks][:jlv_name]}.war_deployed" do
  action :execute
  file_name node[:mocks][:jlv_name]
  file_path node[:mocks][:glassfish_autodeploy_dir]
  file_type "war_deployed"
  log node[:mocks][:chef_log]
end

jlv_wait_for_file "#{node[:mocks][:jlv_old_name]}.war_deployed" do
  action :execute
  file_name node[:mocks][:jlv_old_name]
  file_path node[:mocks][:glassfish_autodeploy_dir]
  file_type "war_deployed"
  log node[:mocks][:chef_log]
end

jlv_wait_for_file "#{node[:mocks][:pdws_name]}.war_deployed" do
  action :execute
  file_name node[:mocks][:pdws_name]
  file_path node[:mocks][:glassfish_autodeploy_dir]
  file_type "war_deployed"
  log node[:mocks][:chef_log]
end

jlv_wait_for_file "#{node[:mocks][:mvi_name]}.war_deployed" do
  action :execute
  file_name node[:mocks][:mvi_name]
  file_path node[:mocks][:glassfish_autodeploy_dir]
  file_type "war_deployed"
  log node[:mocks][:chef_log]
end

service "glassfish" do
  action :stop
end

# /jMeadows/WEB-INF/classes/appconfig-<environment>.properties
# has ip addresses
# example is appconfig-development.properties
template "#{node[:mocks][:glassfish_application_dir]}/#{node[:mocks][:jlv_name]}/WEB-INF/classes/appconfig-development.properties" do
  action :create
  source "jlv/appconfig-development.properties.erb"
  owner "root"
  group "root"
  mode "0644"
  # subscribes :create, resources(:jlv_wait_for_file => "#{node[:jlv][:jmeadows_name]}.war_deployed"), :immediately
end

template "#{node[:mocks][:glassfish_application_dir]}/#{node[:mocks][:jlv_old_name]}/WEB-INF/classes/appconfig-development.properties" do
  action :create
  source "jlv_old/appconfig-development.properties.erb"
  owner "root"
  group "root"
  mode "0644"
  # subscribes :create, resources(:jlv_wait_for_file => "#{node[:jlv][:jmeadows_name]}.war_deployed"), :immediately
end

service "glassfish" do
  action :restart
end
