#
# Cookbook Name:: ehmp_oracle
# Recipe:: oracle_patch
#

execute "move perl executable" do
  command "mv /root/perl/perl-5.14.1/perl #{node['oracle']['home']}/perl/bin/perl"
  action :run
  not_if { File.exist?("#{node['oracle']['home']}/perl/bin/perl") }
end

ehmp_oracle_opatch_upgrade "OPatch upgrade" do
  opatch_source node['ehmp_oracle']['opatch']['source'] 
  not_if "su - oracle -c \"#{node['oracle']['home']}/OPatch/opatch version|grep #{node['ehmp_oracle']['opatch']['version']}\""
end

remote_file "#{Chef::Config['file_cache_path']}/oracle_patch.zip" do
  source node['ehmp_oracle']['patch']['source'] 
  mode   "0755"
  use_conditional_get true
end

execute "extract oracle patch from ZIP" do
  cwd node['oracle']['home']
  command "unzip #{Chef::Config['file_cache_path']}/oracle_patch.zip"
  user node[:oracle_wrapper][:user]
  group node[:oracle_wrapper][:group]
  action :run
  not_if { Dir.exists?("#{node['oracle']['home']}/#{node['ehmp_oracle']['patch']['version']}") }
end

ehmp_oracle_oracle_patch "oracle database patch #{node['ehmp_oracle']['patch']['version']}" do
  patch_path "#{node['oracle']['home']}/#{node['ehmp_oracle']['patch']['version']}"
  patch_number node['ehmp_oracle']['patch']['database_folder']
  patch_type "database"
  not_if "su - oracle -c \"#{node['oracle']['home']}/OPatch/opatch lsinventory|grep #{node['ehmp_oracle']['patch']['database_folder']}\""
end

ehmp_oracle_oracle_patch "oracle javavm patch #{node['ehmp_oracle']['patch']['version']}" do
  patch_path "#{node['oracle']['home']}/#{node['ehmp_oracle']['patch']['version']}"
  patch_number "#{node['ehmp_oracle']['patch']['javavm_folder']}"
  patch_type "javavm"
  not_if "su - oracle -c \"#{node['oracle']['home']}/OPatch/opatch lsinventory|grep #{node['ehmp_oracle']['patch']['javavm_folder']}\""
end