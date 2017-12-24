#
# Cookbook Name:: write_back
# Recipe:: install
#

include_recipe "write_back::service" # Included due to dependency to service resource

remote_file "#{Chef::Config['file_cache_path']}/write_back.zip" do
  source node[:write_back][:source]
  mode   "0755"
  owner node[:write_back][:user]
  group node[:write_back][:group]
  use_conditional_get true
  notifies :stop, "service[#{node[:write_back][:service_config][:name]}]", :immediately
  notifies :delete, "directory[#{node[:write_back][:home_dir]}]", :immediately
  not_if ("mountpoint -q #{node[:write_back][:home_dir]}")
end

directory node[:write_back][:home_dir] do
  mode "0755"
  recursive true
  owner node[:write_back][:user]
  group node[:write_back][:group]
  action :create
end

directory node[:write_back][:log_dir] do
  mode "0755"
  recursive true
  owner node[:write_back][:user]
  group node[:write_back][:group]
  action :create
  notifies :run, "execute[#{node[:write_back][:log_dir]}_ownership_correction]", :immediately
end

execute "#{node[:write_back][:log_dir]}_ownership_correction" do
  command "chown -R #{node[:write_back][:user]}:#{node[:write_back][:group]} #{node[:write_back][:log_dir]}"
  action :nothing
  only_if { Dir.exist? node[:write_back][:log_dir] }
end

directory node[:write_back][:pid_dir] do
  mode "0755"
  recursive true
  owner node[:write_back][:user]
  group node[:write_back][:group]
  action :create
end

directory node[:write_back][:incidents][:root_directory] do
  mode "0755"
  recursive true
  owner node[:write_back][:user]
  group node[:write_back][:group]
  action :create
  notifies :run, "execute[#{node[:write_back][:incidents][:root_directory]}_ownership_correction]", :immediately
end

execute "#{node[:write_back][:incidents][:root_directory]}_ownership_correction" do
  command "chown -R #{node[:write_back][:user]}:#{node[:write_back][:group]} #{node[:write_back][:incidents][:root_directory]}"
  action :nothing
  only_if { Dir.exist? node[:write_back][:incidents][:root_directory] }
end

# Run npm install only if using shared folders
# Because we're root, the full command below needs to be used to run npm install
# CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm
# If we weren't root, we could just do:
# scl enable python27 devtoolset-3 '/usr/local/bin/npm install'
execute "install write_back modules" do
  cwd node[:write_back][:home_dir]
  command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm'"
  notifies :stop, "service[#{node[:write_back][:service_config][:name]}]", :before
  notifies :restart, "service[#{node[:write_back][:service_config][:name]}]"
  only_if ("mountpoint -q #{node[:write_back][:home_dir]}")
end

execute "install write_back oracledb module" do
  cwd node[:write_back][:home_dir]
  command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm oracledb@#{node[:write_back][:oracledb_module][:version]}'"
  action :run
  only_if ("mountpoint -q #{node[:write_back][:home_dir]}")
end

execute "rebuild write_back modules" do
  cwd node[:write_back][:write_dir]
  command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm rebuild --unsafe-perm'"
  action :run
  only_if ("mountpoint -q #{node[:write_back][:home_dir]}")
end

common_extract "#{Chef::Config['file_cache_path']}/write_back.zip" do
  directory node[:write_back][:home_dir]
  owner node[:write_back][:user]
  action :extract_if_missing
  notifies :stop, "service[#{node[:write_back][:service_config][:name]}]", :before
  notifies :restart, "service[#{node[:write_back][:service_config][:name]}]"
  not_if ("mountpoint -q #{node[:write_back][:home_dir]}")
end

mvi = find_node_by_role("mvi", node[:stack], "mocks")

template "#{node[:write_back][:config][:xml_path]}/1305.xml" do
  source "1305.xml.erb"
  mode "644"
  variables({
      :mvi => mvi
  })
  owner node[:write_back][:user]
  group node[:write_back][:group]
  action :create
end

template "#{node[:write_back][:config][:xml_path]}/1309.xml" do
  source "1309.xml.erb"
  mode "644"
  variables({
      :mvi => mvi
  })
  owner node[:write_back][:user]
  group node[:write_back][:group]
  action :create
end
