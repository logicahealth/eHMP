#
# Cookbook Name:: phantomjs_wrapper
# Recipe:: default
#

include_recipe "phantomjs"

if node["platform_family"] == "rhel"
	basename = node['phantomjs']['basename']

	link "remove_bad_link" do
		target_file   '/usr/local/bin/phantomjs'
	  to            "/usr/local/#{basename}/bin/phantomjs"
	  action :delete
	end

	link "correct_phantomjs_link" do
	  target_file   '/usr/local/bin/phantomjs'
	  to            "/usr/local/phantomjs-#{node['phantomjs']['version']}-linux-x86_64/bin/phantomjs"
	  owner         "root"
	  group         "root"
	end
end
