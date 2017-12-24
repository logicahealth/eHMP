#
# Cookbook:: ehmp_oracle
# Resource:: oracle_patch
#

action :execute do

  remote_file "#{Chef::Config['file_cache_path']}/opatch.zip" do
    source new_resource.opatch_source
    mode   "0755"
    use_conditional_get true
  end

  directory "#{node['oracle']['home']}/OPatch" do
    recursive true
    action :delete
  end

  execute "extract opatch from ZIP" do
    cwd node['oracle']['home']
    command "unzip #{Chef::Config['file_cache_path']}/opatch.zip"
    user node[:oracle_wrapper][:user]
    group node[:oracle_wrapper][:group]
    action :run
  end

end
