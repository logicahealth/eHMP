#
# Cookbook Name:: tomcat
# Recipe:: ark
#

include_recipe "ark"

version = node['tomcat']['version'].to_s
tomcat_version = "tomcat#{node['tomcat']['version'].to_s}"
distro = "debian"

# the sysv init script requires an additional package
if platform? [ "centos","redhat","fedora"]
  distro = "el"
end

user node['tomcat']['user']

directory "/usr/local/tomcat" do
  owner node['tomcat']['user']
end

ark tomcat_version do
  url node['tomcat'][version]['url']
  #checksum node['tomcat'][version]['checksum']
  version node['tomcat']['version']
  path  "/usr/local/tomcat"
  home_dir node['tomcat']['home']
  owner node['tomcat']['user']
end

execute 'change permissions of contents in tomcat directory to allow others to see files' do
  command "chmod -R o+rx #{node[:tomcat][:home]}/*"
end

directory "#{node['tomcat']['home']}/webapps/examples" do
  recursive true
  action :delete
end

init_script = template tomcat_version do
  path "/etc/init.d/#{tomcat_version}"
  source "tomcat.init.#{distro}.erb"
  owner "root"
  group "root"
  mode "0774"
  variables( :name => tomcat_version)
end

cookbook_file "#{node['tomcat']['home']}/bin/catalina.sh" do
  source "catalina.sh"
  owner node['tomcat']['user']
  mode "0755"
end

service tomcat_version do
  supports :restart => true, :status => true, :start => true, :stop => true
  action [:enable, :start]
  notifies :run, "execute[wait for 5]", :immediately
end

execute "wait for 5" do
  command "sleep 5"
  action :nothing
end

template "/etc/default/#{tomcat_version}" do
  source "default_tomcat.erb"
  owner "root"
  group "root"
  variables(:tomcat => node['tomcat'].to_hash)
  mode "0644"
  notifies :restart, "service[#{tomcat_version}]", :immediately
end

cookbook_file "#{node[:tomcat][:home]}/conf/catalina.properties" do
  source "catalina.properties"
  owner node[:tomcat][:user]
  mode "0755"
  notifies :restart, "service[#{node[:tomcat][:service]}]", :delayed
end


template "#{node['tomcat']['home']}/conf/logging.properties" do
  source "logging.properties.erb"
  owner node['tomcat']['user']
  mode "0755"
  notifies :restart, "service[#{tomcat_version}]", :delayed
end