#
# Cookbook Name:: jds
# Recipe:: cache
#

file "/tmp/CACHE.DAT" do
  content lazy { ::File.open("#{node[:jds][:cache_jsonvpr_dir]}/CACHE.DAT").read }
  action :create
  only_if { node[:jds][:build_jds] && Dir.exists?(node[:jds][:cache_dir]) }
end

execute "delete existing cache rpm" do
  command "rpm -e #{node.normal[:jds][:rpm_cache_package]}"
  notifies :delete, "directory[#{node[:jds][:cache_dir]}]", :immediately
  not_if { node.normal[:jds][:rpm_cache_package].empty? }
end

template '/etc/init.d/cache' do
  source 'cache_initd.erb'
  owner 'root'
  group 'root'
  mode '0755'
  variables(
    :cache_dir => node[:jds][:cache_dir],
    :cache_service => node[:jds][:cache_service]
  )
  notifies :restart, "service[#{node[:jds][:cache_service]}]"
end

service node[:jds][:cache_service] do
  supports :restart => true
  action :enable
end

directory node[:jds][:installer_dir] do
  mode "0755"
  action :create
end

directory node[:jds][:cache_dir] do
  recursive true
  action :nothing
end

user node[:jds][:cache_user] do
  action :create
end

execute "delete existing cache instance" do
  command "ccontrol delete #{node[:jds][:cache_service]}"
  notifies :delete, "directory[#{node[:jds][:cache_dir]}]", :immediately
  action :nothing
  only_if { Dir.exists?(node[:jds][:cache_dir]) }
end

#remote_file "#{node[:jds][:installer_dir]}/cache.tar.gz" do
#  source node[:jds][:cache_source]
#  notifies :stop, "service[#{node[:jds][:cache_service]}]", :immediately
#  notifies :run, "execute[delete existing cache instance]", :immediately
#end

#file "#{Chef::Config[:file_cache_path]}/jds.ro" do
#  action :nothing
#end

#execute "extract cache tar" do
#  cwd node[:jds][:installer_dir]
#  command "tar -zxvf cache.tar.gz"
#  action :run
#  notifies :run, "execute[install cache tar]", :immediately
#  notifies :delete, "file[#{Chef::Config[:file_cache_path]}/jds.ro]", "immediately"
#  not_if { Dir.exists?(node[:jds][:cache_dir]) }
#end

#execute "install cache tar" do
#  cwd node[:jds][:installer_dir]
#  command "./cinstall_silent"
#  environment node[:jds][:cache_parameter]
#  action :nothing
#  notifies :enable, "service[#{node[:jds][:cache_service]}]", :immediately
#  notifies :start, "service[#{node[:jds][:cache_service]}]", :immediately
#end

execute :modify_cache_owner do
  command "chown -R #{node[:jds][:jds_user]}:#{node[:jds][:cache_user]}  #{node[:jds][:cache_dir]}"
  action :nothing
end

yum_package node[:jds][:cache_package] do
  version node[:jds][:cache_version]
  arch node[:jds][:cache_arch]
  notifies :enable, "service[#{node[:jds][:cache_service]}]", :immediately
  notifies :start, "service[#{node[:jds][:cache_service]}]", :immediately
  notifies :run, "execute[modify_cache_owner]", :immediately
  source node[:jds][:cache_source]
end
