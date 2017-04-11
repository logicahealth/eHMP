#
# Cookbook Name:: mocks
# Recipe:: default
#

template "/etc/init/#{node[:mocks][:node_services][:service]}.conf" do
  variables(
    :name => node[:mocks][:node_services][:service],
    :level => 2346,
    :working_directory => node[:mocks][:node_services][:home_dir],
    :mounted => system("mountpoint -q #{node[:mocks][:node_services][:home_dir]}")
  )
  source 'upstart-mocks-bluepill.erb'
  notifies :restart, "service[#{node[:mocks][:node_services][:service]}]"
end

template "/etc/bluepill/#{node[:mocks][:node_services][:service]}.pill" do
  source 'bluepill-mocks.pill.erb'
  variables(
    :name => node[:mocks][:node_services][:service],
    :working_directory => node[:mocks][:node_services][:home_dir],
    :log_directory => node[:mocks][:node_services][:log_dir],
  )
  notifies :restart, "service[#{node[:mocks][:node_services][:service]}]"
end
