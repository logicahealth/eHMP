#
# Cookbook Name:: ehmp_synapse
# Recipe:: default
#

node.normal['synapse']['zk_hosts'] = find_multiple_nodes_by_role("zookeeper", node[:stack])[0][:zookeeper][:zookeeper_connection].split(",")

haproxy_stats_creds = Chef::EncryptedDataBagItem.load('credentials', node['ehmp_synapse']['haproxy_stats_creds_db'], node['data_bag_string'])
node.normal['synapse']['haproxy']['extra_sections']['stats']['auth'] = "#{haproxy_stats_creds['user']}:#{haproxy_stats_creds['password']}"

include_recipe "synapse"
