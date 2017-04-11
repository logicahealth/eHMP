#
# Cookbook Name:: vx_solr
# Recipe:: prepare_upgrade
#

service 'solr' do
  action :stop
# forcing this to run during compilation, because later on in compilation,
#   chef rewind is unwinding the solr service definition
end.run_action(:stop)

# account for different solr directory structure
glob_solr = Dir.glob('/opt/solr/solr-*')
if glob_solr.length > 1
  raise "More than one solr directory found, cannot proceed with upgrade!"
elsif glob_solr.length == 1
  node.default[:vx_solr][:old_dir] = glob_solr.first
  # set server dir based on server version
  server_dir = if glob_solr.first =~ /solr-5/ then "server" else "example" end
  node.default[:vx_solr][:old_server_dir] = "#{node[:vx_solr][:old_dir]}/#{server_dir}"
else
  raise "A solr installation exists but /opt/solr/solr-*/ does not, cannot proceed with upgrade!"
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
