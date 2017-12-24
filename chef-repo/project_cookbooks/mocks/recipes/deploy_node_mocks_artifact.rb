#
# Cookbook Name:: mocks
# Recipe:: deploy_node_mocks_artifact
#

raise %/

the node attribute's must be set

node[:mocks][:node_services][:source]

you should have set this in the mocks machine file.

/ if node[:mocks][:node_services][:source].nil? || node[:mocks][:node_services][:source].empty? 

remote_file node[:mocks][:node_services][:artifact_path] do
  source node[:mocks][:node_services][:source]
  use_conditional_get true
  checksum node[:mocks][:node_services][:checksum]
  owner node[:mocks][:node_services][:user]
  group node[:mocks][:node_services][:group]
  notifies :delete, 'directory[delete_for_clean_deploy]', :immediately
  not_if ("mountpoint -q #{node[:mocks][:node_services][:home_dir]}")
end

directory 'delete_for_clean_deploy' do
    path node[:mocks][:node_services][:home_dir]
    recursive true
    action :nothing
end

directory node[:mocks][:node_services][:home_dir] do
    recursive true
    owner node[:mocks][:node_services][:user]
    group node[:mocks][:node_services][:group]
    action :create
    notifies :run, "execute[extract_artifact]", :immediately
end

execute "extract_artifact" do
  cwd node[:mocks][:node_services][:home_dir]
  command "unzip #{node[:mocks][:node_services][:artifact_path]}"
  user node[:mocks][:node_services][:user]
  action :nothing
  notifies :restart, "service[#{node[:mocks][:node_services][:service]}]"
  only_if { (Dir.entries(node[:mocks][:node_services][:home_dir]) - %w{ . .. }).empty? }
end

directory node[:mocks][:node_services][:log_dir] do
  owner node[:mocks][:node_services][:user]
  group node[:mocks][:node_services][:group]
  action :create
  notifies :run, "execute[#{node[:mocks][:node_services][:log_dir]}_ownership_correction]", :immediately
end

execute "#{node[:mocks][:node_services][:log_dir]}_ownership_correction" do
  command "chown -R #{node[:mocks][:node_services][:user]}:#{node[:mocks][:node_services][:group]} #{node[:mocks][:node_services][:log_dir]}"
  action :nothing
  only_if { node[:mocks][:node_services][:log_dir] }
end

execute "run_npm_install" do
  cwd node[:mocks][:node_services][:home_dir]
  # Because we're root, the full command below needs to be used to run npm install
  # CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm
  # If we weren't root, we could just do:
  # scl enable python27 devtoolset-3 '/usr/local/bin/npm install'
  command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm'"
  action :run
  notifies :run, 'execute[rebuild_libxmljs]', :immediately
  only_if ("mountpoint -q #{node[:mocks][:node_services][:home_dir]}")
end

execute "rebuild_libxmljs" do
  cwd node[:mocks][:node_services][:libxml_rebuild_dir]
  command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm run install --build-from-source'"
  action :run
  notifies :restart, "service[#{node[:mocks][:node_services][:service]}]"
  only_if ("mountpoint -q #{node[:mocks][:node_services][:home_dir]}")
end

file "#{node[:mocks][:node_services][:home_dir]}/mockHdrPubSub/data.json" do
  owner node[:mocks][:node_services][:user]
  group node[:mocks][:node_services][:group]
  action :nothing
end




