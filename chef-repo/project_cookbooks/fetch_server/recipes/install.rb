#
# Cookbook Name:: fetch_server
# Recipe:: install
#

include_recipe "fetch_server::service" # Included due to dependency to service resource

remote_file "#{Chef::Config['file_cache_path']}/fetch_server.zip" do
  source node[:fetch_server][:source]
  mode   "0755"
  owner node[:fetch_server][:user]
  group node[:fetch_server][:group]
  use_conditional_get true
  notifies :stop, "service[#{node[:fetch_server][:service_config][:name]}]", :immediately
  notifies :delete, "directory[#{node[:fetch_server][:home_dir]}]", :immediately
  not_if ("mountpoint -q #{node[:fetch_server][:home_dir]}")
end

directory node[:fetch_server][:home_dir] do
  mode "0755"
  recursive true
  owner node[:fetch_server][:user]
  group node[:fetch_server][:group]
  action :create
end

directory node[:fetch_server][:log_dir] do
  mode "0755"
  recursive true
  owner node[:fetch_server][:user]
  group node[:fetch_server][:group]
  action :create
  notifies :run, "execute[#{node[:fetch_server][:log_dir]}_ownership_correction]", :immediately
end

execute "#{node[:fetch_server][:log_dir]}_ownership_correction" do
  command "chown -R #{node[:fetch_server][:user]}:#{node[:fetch_server][:group]} #{node[:fetch_server][:log_dir]}"
  action :nothing
  only_if { Dir.exist? node[:fetch_server][:log_dir] }
end

directory node[:fetch_server][:pid_dir] do
  mode "0755"
  recursive true
  owner node[:fetch_server][:user]
  group node[:fetch_server][:group]
  action :create
end

execute "#{node[:fetch_server][:pid_dir]}_ownership_correction" do
  command "chown -R #{node[:fetch_server][:user]}:#{node[:fetch_server][:group]} #{node[:fetch_server][:pid_dir]}"
  action :nothing
  only_if { Dir.exist? node[:fetch_server][:pid_dir] }
end

directory node[:fetch_server][:incidents][:root_directory] do
  mode "0755"
  recursive true
  owner node[:fetch_server][:user]
  group node[:fetch_server][:group]
  action :create
end

execute "#{node[:fetch_server][:incidents][:root_directory]}_ownership_correction" do
  command "chown -R #{node[:fetch_server][:user]}:#{node[:fetch_server][:group]} #{node[:fetch_server][:incidents][:root_directory]}"
  action :nothing
  only_if { Dir.exist? node[:fetch_server][:incidents][:root_directory] }
end

# Run npm install only if using shared folders
# Because we're root, the full command below needs to be used to run npm install
# CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm
# If we weren't root, we could just do:
# scl enable python27 devtoolset-3 '/usr/local/bin/npm install'
execute "install fetch_server modules" do
  cwd node[:fetch_server][:home_dir]
  command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm'"
  notifies :stop, "service[#{node[:fetch_server][:service_config][:name]}]", :before
  notifies :restart, "service[#{node[:fetch_server][:service_config][:name]}]"
  only_if ("mountpoint -q #{node[:fetch_server][:home_dir]}")
end

execute "install fetch_server oracledb module" do
  cwd node[:fetch_server][:home_dir]
  command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm oracledb@#{node[:fetch_server][:oracledb_module][:version]}'"
  action :run
  only_if ("mountpoint -q #{node[:fetch_server][:home_dir]}")
end

execute "rebuild fetch_server modules" do
  cwd node[:fetch_server][:write_dir]
  command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm rebuild --unsafe-perm'"
  action :run
  only_if ("mountpoint -q #{node[:fetch_server][:home_dir]}")
end

common_extract "#{Chef::Config['file_cache_path']}/fetch_server.zip" do
  directory node[:fetch_server][:home_dir]
  owner node[:fetch_server][:user]
  action :extract_if_missing
  notifies :stop, "service[#{node[:fetch_server][:service_config][:name]}]", :before
  notifies :restart, "service[#{node[:fetch_server][:service_config][:name]}]"
  not_if ("mountpoint -q #{node[:fetch_server][:home_dir]}")
end

mvi = find_node_by_role("mvi", node[:stack], "mocks")

template "#{node[:fetch_server][:config][:xml_path]}/1305.xml" do
  source "1305.xml.erb"
  mode "644"
  variables({
      :mvi => mvi
  })
  owner node[:fetch_server][:user]
  group node[:fetch_server][:group]
  action :create
end

template "#{node[:fetch_server][:config][:xml_path]}/1309.xml" do
  source "1309.xml.erb"
  mode "644"
  variables({
      :mvi => mvi
  })
  owner node[:fetch_server][:user]
  group node[:fetch_server][:group]
  action :create
end
