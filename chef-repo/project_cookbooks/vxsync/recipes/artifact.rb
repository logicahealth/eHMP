#
# Cookbook Name:: vxsync
# Recipe:: artifact
#

include_recipe "vxsync::cleanup_old_vxsync"

remote_file "#{node['vxsync']['artifact_path']}" do
  use_conditional_get true
  source node['vxsync']['source']
  mode   "0755"
  owner node[:vxsync][:user]
  group node[:vxsync][:group]
  node['vxsync']['vxsync_applications'].each { |app| notifies :delete, "directory[#{node["vxsync_#{app}"]['home_dir']}]", :immediately }
end

node['vxsync']['vxsync_applications'].each do |app|

  directory node["vxsync_#{app}"]['home_dir'] do
    owner node[:vxsync][:user]
    group node[:vxsync][:group]
    mode "0755"
    recursive true
    action :create
  end

  execute "install modules for vxsync_#{app}" do
    cwd node["vxsync_#{app}"]['home_dir']
    command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm install --unsafe-perm'"
    action :nothing
    not_if { "#{node['vxsync']['source']}".start_with?("http") }
  end

  execute "npm run install on xslt4node java for vxsync_#{app}" do
    cwd "#{node["vxsync_#{app}"]['home_dir']}/node_modules/java"
    command "scl enable python27 devtoolset-3 'CC=/opt/rh/devtoolset-3/root/usr/bin/gcc CXX=/opt/rh/devtoolset-3/root/usr/bin/g++ /usr/local/bin/npm run install --build-from-source'"
    action :nothing
    not_if { "#{node['vxsync']['source']}".start_with?("http") }
  end

  common_extract "extract_#{node['vxsync']['artifact_path']}_for_vxsync_#{app}" do
    file node['vxsync']['artifact_path']
    directory node["vxsync_#{app}"]['home_dir']
    owner node[:vxsync][:user]
    action :extract_if_missing
    notifies :run, "execute[install modules for vxsync_#{app}]", :immediately
    notifies :run, "execute[npm run install on xslt4node java for vxsync_#{app}]", :immediately
    notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
  end

  logrotate_app node[:vxsync][:logrotate][:name] do
    path node[:vxsync][:logrotate][:log_directory]
    options node[:vxsync][:logrotate][:options]
    enable true
    rotate node[:vxsync][:logrotate][:rotate]
    frequency node[:vxsync][:logrotate][:frequency]
    dateformat node[:vxsync][:logrotate][:dateformat]
  end

  logrotate_app node[:vxsync][:audit][:logrotate][:name] do
    path node[:vxsync][:audit][:logrotate][:log_directory]
    options node[:vxsync][:audit][:logrotate][:options]
    enable true
    rotate node[:vxsync][:audit][:logrotate][:rotate]
    frequency node[:vxsync][:audit][:logrotate][:frequency]
    dateformat node[:vxsync][:audit][:logrotate][:dateformat]
  end

end
