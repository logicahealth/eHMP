#
# Cookbook Name:: vx_solr
# Recipe:: service
#

chef_gem "chef-rewind" do
  version node[:vx_solr][:service][:'chef-rewind_version']
end

require 'chef/rewind'

# remove the service resource that was defined in the third party cookbook
# two reasons why we do this:
#   1. use the bin/solr script to start solr instead of solr.start
#   2. ecryptfs must be mounted before solr starts
unwind 'service[solr]'

zk_config = node[:vx_solr][:zookeeper][:instances].map { |instance| "#{instance[:hostname]}:#{instance[:client_port]}" }.join(",")

template '/etc/init.d/solr' do
  source 'initd.erb'
  owner 'root'
  group 'root'
  mode '0755'
  variables(
    :script => node[:vx_solr][:service][:script],
    :solr_port => node[:solr][:port],
    :zk_config => zk_config,
    :jvm_params => node[:vx_solr][:service][:jvm_params],
    :memory => node[:vx_solr][:service][:memory],
    :solr_instances => node[:vx_solr][:service][:solr_instances],
    :additional_instance_base_port => node[:vx_solr][:service][:additional_instance_base_port],
    :log_file => node[:solr][:log_file]
  )
  notifies :stop, "service[solr]", :before
end

node.default[:vx_solr][:service][:solr_host] = node[:ipaddress]
template "#{node[:solr][:dir]}-#{node[:solr][:version]}/bin/solr.in.sh" do
  variables(
    :solr_host => node[:vx_solr][:service][:solr_host]
  )
  notifies :stop, "service[solr]", :before
end

# create home directories for each additional solr instance
2.upto(node[:vx_solr][:service][:solr_instances]) do |instance|
  home_dir = "#{node[:vx_solr][:server_dir]}/home#{instance}"

  directory home_dir

  file "#{home_dir}/solr.xml" do
    content ::File.open("#{node[:vx_solr][:server_dir]}/solr/solr.xml").read
    notifies :stop, "service[solr]", :before
  end
end

service 'solr' do
  supports :restart => true, :status => true
  action [:enable, :start]
end
