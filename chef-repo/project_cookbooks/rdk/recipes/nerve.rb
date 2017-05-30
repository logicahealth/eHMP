#
# Cookbook Name:: rdk
# Recipe:: nerve
#

include_recipe 'nerve_wrapper'

node[:rdk][:services].each do |name, config|
	next if ["activity_handler", "vista_aso_rejector"].include? name
	1.upto(config[:processes]) do |index|

		nerve_wrapper "#{name}-#{index}" do
			host node[:ipaddress]
			port config[:port] - 1 + index
			checks config[:nerve][:checks]
			check_interval config[:nerve][:check_interval]
			service_type name
		end

	end

end
