#
# Cookbook Name:: communications-cli
# Recipe:: install
#

remote_file "#{Chef::Config['file_cache_path']}/communications-cli.tgz" do
  source node['communications_cli']['install']['source']
  mode   "0755"
  use_conditional_get true
  notifies :delete, "directory[#{node['communications_cli']['install']['dir']}]", :immediately
end

directory node['communications_cli']['install']['dir'] do
  mode "0755"
  recursive true
  action :create
end

execute "extract_communications-cli.tgz" do
  cwd node['communications_cli']['install']['dir']
  command "tar -zxvf #{Chef::Config.file_cache_path}/communications-cli.tgz"
  only_if { (Dir.entries(node['communications_cli']['install']['dir']) - %w{ . .. }).empty? }
end
