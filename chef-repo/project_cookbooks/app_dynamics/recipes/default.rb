#Cookbook Name:: apm
# Recipe:: default
#

directory node[:app_dynamics][:proxy][:home] do
  mode "0755"
  action :create
end

directory node[:app_dynamics][:proxy][:ctl_dir] do
  mode "0755"
  action :create
end

directory node[:app_dynamics][:proxy][:log_path] do
  mode "0755"
  action :create
end

# Create a template for upstart
template "/etc/init/appd_proxy.conf" do
  source "appd_proxy.conf.erb"
  notifies :restart, "service[appd_proxy]"
end

service "appd_proxy" do
  provider Chef::Provider::Service::Upstart
  start_command "/sbin/start appd_proxy"
  action [ :enable, :start ]
end
