#
# Cookbook Name:: nerve_wrapper
# Recipe:: default
#

ruby_block "set_nerve_zk_host_array" do
    block do

      node.normal['nerve_wrapper']['hosts'] = find_multiple_nodes_by_role("zookeeper", node[:stack])[0][:zookeeper][:zookeeper_connection].split(",")
    
    end
    only_if { node['nerve_wrapper']['hosts'].nil? }
  end

include_recipe "nerve"
