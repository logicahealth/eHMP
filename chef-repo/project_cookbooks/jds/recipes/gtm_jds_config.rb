yum_package 'git'

# Temp env for the chef script
gtm_environment = {
  'vista_home'=>"#{node[:jds][:gtm_jds_install_dir]}",
  'gtm_dist'=>"/usr/lib/fis-gtm/#{node[:jds][:gtm_version]}_#{node[:jds][:gtm_arch]}/",
  'gtmgbldir'=>"#{node[:jds][:gtm_jds_install_dir]}/g/mumps.gld",
  'gtmroutines'=>"$vista_home/o*($vista_home/r) $gtm_dist/libgtmutil.so"
}

# Get JDS source code (fixed up for GT.M)
git "#{Chef::Config[:file_cache_path]}/JDS-GTM" do
  repository 'git://github.com/OSEHRA-Sandbox/JDS-GTM'
  reference 'master'
  action :sync
end

# Create database directories
directory "#{node[:jds][:gtm_jds_install_dir]}" do
  action :create
  owner node[:jds][:gtm_user]
  group node[:jds][:gtm_user]
  mode "0755"
end

%w[o r g j].each do |dir|
  directory "#{node[:jds][:gtm_jds_install_dir]}/#{dir}" do
    action :create
    owner node[:jds][:gtm_user]
    group node[:jds][:gtm_user]
    mode "0755"
    recursive true
  end
end

# Copy all routines over
execute "Copy JDS Routines" do
  command "cp #{Chef::Config[:file_cache_path]}/JDS-GTM/*.m #{node[:jds][:gtm_jds_install_dir]}/r/"
end

# All routines are re-writable
execute "Make routines writable by user or group" do
  command "chmod -R 0660 #{node[:jds][:gtm_jds_install_dir]}/r/"
end

execute "Make r directory executable" do
  command "chmod 0770 #{node[:jds][:gtm_jds_install_dir]}/r"
end

execute "Make r owned by gtmuser:gtmuser" do
  command "chown -R gtmuser:gtmuser #{node[:jds][:gtm_jds_install_dir]}/r/"
end

execute "Compile JDS Routines" do
  cwd    "#{node[:jds][:gtm_jds_install_dir]}/o"
  environment gtm_environment
  command "for r in ../r/*.m; do $gtm_dist/mumps -nowarning $r; done"
end

template "#{node[:jds][:gtm_jds_install_dir]}/g/db.gde" do
  owner node[:jds][:gtm_user]
  group node[:jds][:gtm_user]
  mode "0644"
  source "db.gde.erb"
end

template "#{node[:jds][:gtm_jds_install_dir]}/env.vista" do
  owner node[:jds][:gtm_user]
  group node[:jds][:gtm_user]
  mode "0644"
  source "env.vista.erb"
end

template "#{node[:jds][:gtm_jds_install_dir]}/journaling.vista" do
  owner node[:jds][:gtm_user]
  group node[:jds][:gtm_user]
  mode "0755"
  source "journaling.vista.erb"
end

execute "Define JDS GT.M Database" do
  cwd     node[:jds][:gtm_jds_install_dir]
  command "$gtm_dist/mumps -r ^GDE < g/db.gde |& tee g/db.gde.out"
  environment gtm_environment
end

execute "Create JDS GT.M Database" do
  cwd     node[:jds][:gtm_jds_install_dir]
  command "$gtm_dist/mupip create"
  environment gtm_environment
end

execute "Turn on Journaling" do
  cwd     node[:jds][:gtm_jds_install_dir]
  command ". ./journaling.vista"
end

# initd script next.
template "/etc/init.d/#{node[:jds][:service_name]}" do
  source 'gtm_initd.erb'
  owner 'root'
  group 'root'
  mode '0755'
end

# Just define the service
service node[:jds][:service_name] do
  supports :restart => true
end

