#
# Cookbook Name:: pick_list
# Recipe:: install
#

include_recipe "pick_list::service" # Included due to dependency to service resource

remote_file "#{Chef::Config['file_cache_path']}/pick_list.zip" do
  source node[:pick_list][:source]
  mode   "0755"
  owner node[:pick_list][:user]
  group node[:pick_list][:group]
  use_conditional_get true
  notifies :stop, "service[#{node[:pick_list][:service_config][:name]}]", :immediately
  notifies :delete, "directory[#{node[:pick_list][:home_dir]}]", :immediately
  not_if ("mountpoint -q #{node[:pick_list][:home_dir]}")
end

directory node[:pick_list][:home_dir] do
  mode "0755"
  recursive true
  owner node[:pick_list][:user]
  group node[:pick_list][:group]
  action :create
end

directory node[:pick_list][:log_dir] do
  mode "0755"
  recursive true
  owner node[:pick_list][:user]
  group node[:pick_list][:group]
  action :create
  notifies :run, "execute[#{node[:pick_list][:log_dir]}_ownership_correction]", :immediately
end

execute "#{node[:pick_list][:log_dir]}_ownership_correction" do
  command "chown -R #{node[:pick_list][:user]}:#{node[:pick_list][:group]} #{node[:pick_list][:log_dir]}"
  action :nothing
  only_if { Dir.exist? node[:pick_list][:log_dir] }
end

directory node[:pick_list][:pid_dir] do
  mode "0755"
  recursive true
  owner node[:pick_list][:user]
  group node[:pick_list][:group]
  action :create
end

execute "#{node[:pick_list][:pid_dir]}_ownership_correction" do
  command "chown -R #{node[:pick_list][:user]}:#{node[:pick_list][:group]} #{node[:pick_list][:pid_dir]}"
  action :nothing
  only_if { Dir.exist? node[:pick_list][:pid_dir] }
end

directory node[:pick_list][:incidents][:root_directory] do
  mode "0755"
  recursive true
  owner node[:pick_list][:user]
  group node[:pick_list][:group]
  action :create
end

execute "#{node[:pick_list][:incidents][:root_directory]}_ownership_correction" do
  command "chown -R #{node[:pick_list][:user]}:#{node[:pick_list][:group]} #{node[:pick_list][:incidents][:root_directory]}"
  action :nothing
  only_if { Dir.exist? node[:pick_list][:incidents][:root_directory] }
end

# Run npm install only if using shared folders
# Because we're root, the full command below needs to be used to run npm install
# CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm
# If we weren't root, we could just do:
# scl enable python27 devtoolset-3 '/usr/local/bin/npm install'
execute "install pick_list modules" do
  cwd node[:pick_list][:home_dir]
  command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm'"
  notifies :stop, "service[#{node[:pick_list][:service_config][:name]}]", :before
  notifies :restart, "service[#{node[:pick_list][:service_config][:name]}]"
  only_if ("mountpoint -q #{node[:pick_list][:home_dir]}")
end

execute "install pick_list oracledb module" do
  cwd node[:pick_list][:home_dir]
  command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm oracledb@#{node[:pick_list][:oracledb_module][:version]}'"
  action :run
  only_if ("mountpoint -q #{node[:pick_list][:home_dir]}")
end

execute "rebuild pick_list modules" do
  cwd node[:pick_list][:write_dir]
  command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm rebuild --unsafe-perm'"
  action :run
  only_if ("mountpoint -q #{node[:pick_list][:home_dir]}")
end

common_extract "#{Chef::Config['file_cache_path']}/pick_list.zip" do
  directory node[:pick_list][:home_dir]
  owner node[:pick_list][:user]
  action :extract_if_missing
  notifies :stop, "service[#{node[:pick_list][:service_config][:name]}]", :before
  notifies :restart, "service[#{node[:pick_list][:service_config][:name]}]"
  not_if ("mountpoint -q #{node[:pick_list][:home_dir]}")
end

mvi = find_node_by_role("mvi", node[:stack], "mocks")

template "#{node[:pick_list][:config][:xml_path]}/1305.xml" do
  source "1305.xml.erb"
  mode "644"
  variables({
      :mvi => mvi
  })
  owner node[:pick_list][:user]
  group node[:pick_list][:group]
  action :create
end

template "#{node[:pick_list][:config][:xml_path]}/1309.xml" do
  source "1309.xml.erb"
  mode "644"
  variables({
      :mvi => mvi
  })
  owner node[:pick_list][:user]
  group node[:pick_list][:group]
  action :create
end
