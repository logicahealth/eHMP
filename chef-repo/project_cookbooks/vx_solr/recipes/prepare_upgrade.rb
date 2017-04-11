#
# Cookbook Name:: vx_solr
# Recipe:: prepare_upgrade
#

service 'solr' do
  action :stop
# forcing this to run during compilation, because later on in compilation,
#   chef rewind is unwinding the solr service definition
end.run_action(:stop)

# account for different directory structure in solr 4
glob_solr4 = Dir.glob('/opt/solr/solr-4*')
if glob_solr4.length > 1
  raise "More than one solr 4 directory found, cannot proceed with upgrade!"
elsif glob_solr4.length == 1
  node.default[:vx_solr][:old_dir] = glob_solr4.first
  node.default[:vx_solr][:old_server_dir] = "#{node[:vx_solr][:old_dir]}/example"
end

mount "#{node[:vx_solr][:old_server_dir]}/logs" do
  device "#{node[:vx_solr][:old_server_dir]}/logs"
  fstype "ecryptfs"
  action [:umount, :disable]
end

directory node[:vx_solr][:upgrade_dir] do
  owner  'root'
  group  'root'
  mode   "0755"
  recursive true
end

execute "store solr vpr data" do
 command "cp -R #{node[:vx_solr][:old_server_dir]}/solr #{node[:vx_solr][:upgrade_dir]}"
end

execute "store solr logs" do
 command "cp -R #{node[:vx_solr][:old_server_dir]}/logs #{node[:vx_solr][:upgrade_dir]}"
end
