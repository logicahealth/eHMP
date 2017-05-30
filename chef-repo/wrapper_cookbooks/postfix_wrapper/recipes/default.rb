#
# Cookbook Name:: postfix_wrapper
# Recipe:: default
#
node.normal['postfix']['main']['relayhost'] = data_bag_item("servers", "smtp").to_hash["ip"]

include_recipe 'postfix'

resources(:package => 'postfix').action :upgrade
