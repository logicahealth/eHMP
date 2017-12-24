#
# Cookbook Name:: activity_handler
# Recipe:: install
#

include_recipe "activity_handler::service" # Included due to dependency to service resource

remote_file "#{Chef::Config['file_cache_path']}/activity_handler.zip" do
  source node[:activity_handler][:source]
  mode   "0755"
  owner node[:activity_handler][:user]
  group node[:activity_handler][:group]
  use_conditional_get true
  notifies :stop, "service[#{node[:activity_handler][:service_config][:name]}]", :immediately
  notifies :delete, "directory[#{node[:activity_handler][:home_dir]}]", :immediately
  not_if ("mountpoint -q #{node[:activity_handler][:home_dir]}")
end

directory node[:activity_handler][:home_dir] do
  mode "0755"
  recursive true
  owner node[:activity_handler][:user]
  group node[:activity_handler][:group]
  action :create
end

directory node[:activity_handler][:log_dir] do
  mode "0755"
  recursive true
  owner node[:activity_handler][:user]
  group node[:activity_handler][:group]
  action :create
  notifies :run, "execute[#{node[:activity_handler][:log_dir]}_ownership_correction]", :immediately
end

execute "#{node[:activity_handler][:log_dir]}_ownership_correction" do
  command "chown -R #{node[:activity_handler][:user]}:#{node[:activity_handler][:group]} #{node[:activity_handler][:log_dir]}"
  action :nothing
  only_if { Dir.exist? node[:activity_handler][:log_dir] }
end

directory node[:activity_handler][:pid_dir] do
  mode "0755"
  recursive true
  owner node[:activity_handler][:user]
  group node[:activity_handler][:group]
  action :create
  notifies :run, "execute[#{node[:activity_handler][:pid_dir]}_ownership_correction]", :immediately
end

execute "#{node[:activity_handler][:pid_dir]}_ownership_correction" do
  command "chown -R #{node[:activity_handler][:user]}:#{node[:activity_handler][:group]} #{node[:activity_handler][:pid_dir]}"
  action :nothing
  only_if { Dir.exist? node[:activity_handler][:pid_dir] }
end

directory node[:activity_handler][:incidents][:root_directory] do
  mode "0755"
  recursive true
  owner node[:activity_handler][:user]
  group node[:activity_handler][:group]
  action :create
end

execute "#{node[:activity_handler][:incidents][:root_directory]}_ownership_correction" do
  command "chown -R #{node[:activity_handler][:user]}:#{node[:activity_handler][:group]} #{node[:activity_handler][:incidents][:root_directory]}"
  action :nothing
  only_if { Dir.exist? node[:activity_handler][:incidents][:root_directory] }
end

# Run npm install only if using shared folders
# Because we're root, the full command below needs to be used to run npm install
# CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm
# If we weren't root, we could just do:
# scl enable python27 devtoolset-3 '/usr/local/bin/npm install'
execute "install activity_handler modules" do
  cwd node[:activity_handler][:home_dir]
  command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm'"
  notifies :stop, "service[#{node[:activity_handler][:service_config][:name]}]", :before
  notifies :restart, "service[#{node[:activity_handler][:service_config][:name]}]"
  only_if ("mountpoint -q #{node[:activity_handler][:home_dir]}")
end

execute "install activity_handler oracledb module" do
  cwd node[:activity_handler][:home_dir]
  command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm oracledb@#{node[:activity_handler][:oracledb_module][:version]}'"
  action :run
  only_if ("mountpoint -q #{node[:activity_handler][:home_dir]}")
end

execute "rebuild activity_handler modules" do
  cwd node[:activity_handler][:write_dir]
  command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm rebuild --unsafe-perm'"
  action :run
  only_if ("mountpoint -q #{node[:activity_handler][:home_dir]}")
end

common_extract "#{Chef::Config['file_cache_path']}/activity_handler.zip" do
  directory node[:activity_handler][:home_dir]
  owner node[:activity_handler][:user]
  action :extract_if_missing
  notifies :stop, "service[#{node[:activity_handler][:service_config][:name]}]", :before
  notifies :restart, "service[#{node[:activity_handler][:service_config][:name]}]"
  not_if ("mountpoint -q #{node[:activity_handler][:home_dir]}")
end

mvi = find_node_by_role("mvi", node[:stack], "mocks")

template "#{node[:activity_handler][:config][:xml_path]}/1305.xml" do
  source "1305.xml.erb"
  mode "644"
  variables({
      :mvi => mvi
  })
  owner node[:activity_handler][:user]
  group node[:activity_handler][:group]
  action :create
end

template "#{node[:activity_handler][:config][:xml_path]}/1309.xml" do
  source "1309.xml.erb"
  mode "644"
  variables({
      :mvi => mvi
  })
  owner node[:activity_handler][:user]
  group node[:activity_handler][:group]
  action :create
end
