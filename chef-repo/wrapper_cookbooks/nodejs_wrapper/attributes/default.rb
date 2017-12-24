#
# Cookbook Name:: nodsjs_wrapper
# Attributes:: default
#
#

default[:nodejs][:version] = "v6.10.2"
default[:nodejs][:install_method] = "binary"
default[:nodejs][:binary][:checksum] = "a180da10fcac4a35c3de52857633dd965232b308ba151f787f3ead8012a1113b"
default[:nodejs][:binary][:url] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/nodejs/node/#{node[:nodejs][:version]}/node-#{node[:nodejs][:version]}-x64.tgz"

default[:nodejs_wrapper][:node_path] = "/usr/local/nodejs-#{node['nodejs']['install_method']}-#{node['nodejs']['version']}"
default[:nodejs_wrapper][:node_bin_path] = "#{node[:nodejs_wrapper][:node_path]}/bin"
