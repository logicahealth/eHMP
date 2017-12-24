#
# Cookbook Name:: oracle_wrapper
# Recipe:: update_hostname
#

include_recipe "oracle_wrapper::listener_ora"

service 'hostname oracle restart' do
  service_name 'oracle'
  action :nothing
end

execute "update oracle hostname" do
  cwd "#{node['oracle']['rdbms']['ora_home_12c']}/network/admin"
  user 'oracle'
  command "sed -i 's/oracle-orabox-master/#{node['hostname']}/' tnsnames.ora"
  not_if "grep #{node['hostname']} tnsnames.ora"
  notifies :restart, "service[hostname oracle restart]", :immediately
end
