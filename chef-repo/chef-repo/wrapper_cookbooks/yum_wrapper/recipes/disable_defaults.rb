#
# Cookbook Name:: yum_wrapper
# Recipe:: disable_defaults
#

(Dir.entries("/etc/yum.repos.d") - [".", "..", "#{node['yum_wrapper']['localrepo']['name']}.repo"]).each{ |repo|
	yum_repository repo.split(".repo")[0] do
	  enabled false
	end
}
