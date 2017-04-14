#
# Cookbook Name:: mocks
# Recipe:: default
#

service_name = node[:mocks][:node_services][:service]

 service service_name do
    action :stop
    notifies :delete, "file[#{node[:mocks][:node_services][:home_dir]}/mockHdrPubSub/data.json]",  :immediately
 end

service service_name do
  provider Chef::Provider::Service::Upstart
  restart_command "/sbin/stop mocks_server; /sbin/start mocks_server"
  action [:enable, :start] 
end
