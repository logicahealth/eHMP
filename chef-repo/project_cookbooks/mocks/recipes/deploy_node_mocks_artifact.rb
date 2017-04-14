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
    action :create
    notifies :run, "execute[extract_artifact]", :immediately
end

execute "extract_artifact" do
  cwd node[:mocks][:node_services][:home_dir]
  command "unzip #{node[:mocks][:node_services][:artifact_path]}"
  action :nothing
  notifies :restart, "service[#{node[:mocks][:node_services][:service]}]"
  only_if { (Dir.entries(node[:mocks][:node_services][:home_dir]) - %w{ . .. }).empty? }
end

directory node[:mocks][:node_services][:log_dir] do
  action :create
end

execute "run_npm_install" do
  cwd node[:mocks][:node_services][:home_dir]
  command "sudo /usr/local/bin/npm install"
  action :run
  notifies :run, 'execute[rebuild_libxmljs]', :immediately
  only_if ("mountpoint -q #{node[:mocks][:node_services][:home_dir]}")
end

execute "rebuild_libxmljs" do
  cwd node[:mocks][:node_services][:libxml_rebuild_dir]
  command "sudo /usr/local/bin/npm run install"
  action :run
  notifies :restart, "service[#{node[:mocks][:node_services][:service]}]"
  only_if ("mountpoint -q #{node[:mocks][:node_services][:home_dir]}")
end

file "#{node[:mocks][:node_services][:home_dir]}/mockHdrPubSub/data.json" do
  action :nothing
end




