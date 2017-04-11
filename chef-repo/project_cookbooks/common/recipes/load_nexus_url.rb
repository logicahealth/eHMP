#
# Cookbook Name:: common
# Recipe:: load_nexus_url
#

#Load Nexus URL from Data Bag
nexus_info = data_bag_item('servers', 'nexus').to_hash
node.default[:common][:nexus_url] = nexus_info['fqdn']
