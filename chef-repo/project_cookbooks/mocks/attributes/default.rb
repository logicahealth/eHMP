#
# Cookbook Name:: mocks
# Attributes:: default
#

include_attribute "mocks::das"


default[:mocks][:chef_log] =     STDOUT

default[:mocks][:include_jmeadows] = true

############################################
# node mocks services
############################################
default[:mocks][:node_services][:source] = nil # options the uri should be either https://some.thing.com/stuff... or file:///path/to/artifact.ext
default[:mocks][:node_services][:filename] = "node_mock_services"
default[:mocks][:node_services][:checksum] = nil
default[:mocks][:node_services][:service] = "mocks_server"
default[:mocks][:node_services][:user] = 'node'
default[:mocks][:node_services][:group] = 'node'
default[:mocks][:node_services][:artifact_path] = "#{Chef::Config['file_cache_path']}/#{node[:mocks][:node_services][:filename]}"
default[:mocks][:node_services][:home_dir] = "/opt/#{node[:mocks][:node_services][:service]}"
default[:mocks][:node_services][:log_dir] = "#{node[:mocks][:node_services][:home_dir]}/logs"
default[:mocks][:fqdn] = "mock.vistacore.us"
default[:mocks][:ajp][:port] = "8896"
default[:mocks][:node_services][:libxml_rebuild_dir] = "#{node[:mocks][:node_services][:home_dir]}/node_modules/libxmljs"

default[:mocks][:node_services][:processes] = {
	:mocks_main => {
		:start_command => "sh ./run.sh"
	},
	:mock_das => {
		:start_command => "/usr/local/bin/node ./mockDas/mockDas.js --port #{node[:das][:vlerdas][:port]}"
	}
}