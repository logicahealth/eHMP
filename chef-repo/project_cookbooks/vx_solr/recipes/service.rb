#
# Cookbook Name:: vx_solr
# Recipe:: service
#

# remove the service resource that was defined in the third party cookbook
# two reasons why we do this:
#   1. use the bin/solr script to start solr instead of solr.start
#   2. ecryptfs must be mounted before solr starts
delete_resource(:service, 'solr')

zookeeper_nodes = find_multiple_nodes_by_role("zookeeper", node[:stack])
# get zookeeper information from first zookeeper node found (this attribute should be the same for all zookeeper nodes)
node.default[:vx_solr][:zookeeper][:zookeeper_connection] = zookeeper_nodes[0][:zookeeper][:zookeeper_connection]

execute 'chown solr log directory to solr user' do
  command "chown -R #{node['solr']['user']}:#{node['solr']['group']} #{node[:vx_solr][:log_dir]}"
  action :nothing
  subscribes :run, "directory[#{node['solr']['data_dir']}]", :immediately
  notifies :stop, "service[solr]", :before
  only_if { Dir.exist? node[:vx_solr][:log_dir] }
end

node.default[:vx_solr][:service_script] = template '/etc/init.d/solr' do
  source 'initd.erb'
  owner 'root'
  group 'root'
  mode '0755'
  variables(
    :script => node[:vx_solr][:service][:script],
    :solr_port => node[:solr][:port],
    :zk_config => node[:vx_solr][:zookeeper][:zookeeper_connection],
    :jvm_params => node[:vx_solr][:service][:jvm_params],
    :memory => node[:vx_solr][:service][:memory],
    :solr_instances => node[:vx_solr][:service][:solr_instances],
    :additional_instance_base_port => node[:vx_solr][:service][:additional_instance_base_port],
    :solr_user => node['solr']['user']
  )
  notifies :stop, "service[solr]", :before
end

node.default[:vx_solr][:service][:solr_host] = node[:ipaddress]
template "#{node[:solr][:dir]}-#{node[:solr][:version]}/bin/solr.in.sh" do
  owner node['solr']['user']
  group node['solr']['group']
  variables(
    :solr_host => node[:vx_solr][:service][:solr_host],
    :zk_client_timeout => node[:vx_solr][:service][:zk_client_timeout],
    :solr_log_dir => node[:vx_solr][:log_dir],
    :solr_heap => node[:vx_solr][:service][:heap]
  )
  notifies :stop, "service[solr]", :before
end

# create home directories for each additional solr instance
2.upto(node[:vx_solr][:service][:solr_instances]) do |instance|
  home_dir = "#{node[:vx_solr][:server_dir]}/home#{instance}"

  directory home_dir do
    owner node['solr']['user']
    group node['solr']['group']
  end

  file "#{home_dir}/solr.xml" do
    owner node['solr']['user']
    group node['solr']['group']
    content lazy{::File.open("#{node[:vx_solr][:server_dir]}/solr/solr.xml").read}
    notifies :stop, "service[solr]", :before
  end
end

service 'solr' do
  supports :restart => true, :status => true
  action [:enable, :start]
end
