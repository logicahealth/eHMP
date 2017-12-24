#
# Cookbook Name:: oracle_wrapper
# Recipe:: listener_ora
#

service 'listener oracle service' do
  service_name 'oracle'
  action :nothing
end

template "#{node[:oracle][:rdbms][:ora_home_12c]}/network/admin/listener.ora" do
  owner 'oracle'
  group 'oinstall'
  mode '0644'
  notifies :stop, "service[listener oracle service]", :before
  notifies :start, "service[listener oracle service]", :immediately
  action :create_if_missing
end
