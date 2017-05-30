#
# Cookbook Name:: oracle_wrapper
# Recipe:: install
#

# most of this recipe is taken from the dbbin recipe from the third party cookbook
# changes and additions are made to support version 11.2.0.1 and make the recipe idempotent and are marked with comments
# see original recipe for original comments

file "#{node[:oracle][:ora_inventory]}/ContentsXML/comps.xml" do
  only_if { File.directory?("#{node[:oracle][:ora_inventory]}/ContentsXML" ) }
  mode '00664'
end

file "#{node[:oracle][:ora_inventory]}/ContentsXML/libs.xml" do
  only_if { File.directory?("#{node[:oracle][:ora_inventory]}/ContentsXML" ) }
  mode '00664'
end

execute "chown_back_to_oinstall" do
  only_if { File.directory?("#{node[:oracle][:ora_inventory]}/ContentsXML" ) }
  command "chown -R oracle:oinstall *"
  cwd node[:oracle][:ora_inventory]
end

[node[:oracle][:ora_base], node[:oracle][:rdbms][:install_dir]].each do |dir|
  directory dir do
    owner 'oracle'
    group 'oinstall'
    mode '0755'
    action :create
  end
end

yum_package 'unzip'

node[:oracle][:rdbms][:install_files].each do |zip_file|
  filename = File.basename(zip_file)

  # use remote_file instead of execute + curl to download installation files
  # download to file cache instead
  remote_file "#{Chef::Config[:file_cache_path]}/#{filename}" do
    source zip_file
    owner "oracle"
    group "oinstall"
    use_conditional_get true
  end

  # unzip from file cache
  # add -o to unzip to make recipe idempotent
  execute "unzip_oracle_media_#{filename}" do
    command "unzip -o #{Chef::Config[:file_cache_path]}/#{filename} -d #{node[:oracle][:rdbms][:install_dir]}"
    user "oracle"
    group 'oinstall'
  end
end

file "#{node[:oracle][:ora_base]}/oraInst.loc" do
  owner "oracle"
  group 'oinstall'
  content "inst_group=oinstall\ninventory_loc=/opt/oraInventory"
end

directory node[:oracle][:ora_inventory] do
  owner 'oracle'
  group 'oinstall'
  mode '0755'
  action :create
end

template "#{node[:oracle][:rdbms][:install_dir]}/db11R23.rsp" do
  cookbook 'oracle'
  owner 'oracle'
  group 'oinstall'
  mode '0644'
end

# remove options incompatible with version 11.2.0.1
# add 253 (warnings?) and 254 (already installed) as acceptable exit codes
bash 'run_rdbms_installer' do
  cwd "#{node[:oracle][:rdbms][:install_dir]}/database"
  environment (node[:oracle][:rdbms][:env])
  code "sudo -Eu oracle ./runInstaller -silent -waitforcompletion -ignoreSysPrereqs -responseFile #{node[:oracle][:rdbms][:install_dir]}/db11R23.rsp -invPtrLoc #{node[:oracle][:ora_base]}/oraInst.loc"
  returns [0, 6, 253]
  not_if { File.exist? node[:oracle][:rdbms][:ora_home] }
end

execute 'root.sh_rdbms' do
  command "#{node[:oracle][:rdbms][:ora_home]}/root.sh"
end

template "#{node[:oracle][:rdbms][:ora_home]}/network/admin/listener.ora" do
  owner 'oracle'
  group 'oinstall'
  mode '0644'
  cookbook 'oracle'
end

# install sqlnet.ora
cookbook_file "#{node[:oracle][:rdbms][:ora_home]}/network/admin/sqlnet.ora" do
  owner 'oracle'
  group 'oinstall'
  mode '0644'
end

cookbook_file "#{node[:oracle][:rdbms][:ora_home]}/sqlplus/admin/glogin.sql" do
  owner 'oracle'
  group 'oinstall'
  mode '0644'
  cookbook 'oracle'
end

template '/etc/init.d/oracle' do
  source 'ora_init_script.erb'
  mode '0755'
end

service 'start oracle' do
  service_name 'oracle'
  action [:enable, :start]
end

# removed else block for running install for oracle 12
