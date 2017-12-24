#
# Cookbook Name:: communications_cli
# Attributes:: default
#

default['communications_cli']['install']['dir'] = "/opt/communications-cli"
default['communications_cli']['install']['version'] = '0.0.0.105'
default['communications_cli']['install']['source'] = "#{node[:nexus_url]}/nexus/content/repositories/releases/us/vistacore/communications-cli/communications-cli/#{node['communications_cli']['install']['version']}/communications-cli-#{node['communications_cli']['install']['version']}.tgz"
