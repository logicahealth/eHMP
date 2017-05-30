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

template "#{node[:jds][:gtm_jds_install_dir]}/myenv.jds" do
  owner node[:jds][:gtm_user]
  group node[:jds][:gtm_user]
  mode "0644"
  source "env.vista.erb"
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
  command ". ./myenv.jds"
end

user_password = ''

# Run JDS configuration setup
jds_mumps_block "Run JDS configuration" do
  cache_username node[:jds][:default_admin_user]
  cache_password user_password
  namespace node[:jds][:cache_namespace]
  command [
    "D SETUP^VPRJCONFIG"
  ]
  log node[:jds][:chef_log]
end

# Add configured Generic Data Stores
node[:jds][:data_store].each do |key,store|
  jds_mumps_block "Add configuration for #{key} data store" do
    cache_username node[:jds][:default_admin_user]
    cache_password user_password
    namespace node[:jds][:cache_namespace]
    command [
      "D ADDSTORE^VPRJCONFIG(\"" + store + "\")"
    ]
    log node[:jds][:chef_log]
  end
end

# initd script next.
template "/etc/init.d/#{node[:jds][:service_name]}" do
  source 'gtm_initd.erb'
  owner 'root'
  group 'root'
  mode '0755'
end

# Use initd script to start the listeners
service node[:jds][:service_name] do
  supports :restart => true
  action :restart
end

