#
# Cookbook Name:: yum_wrapper
# Recipe:: disable_defaults
#

(Dir.entries("/etc/yum.repos.d") - [".", "..", "#{node['yum_wrapper']['localrepo']['name']}.repo", "#{node['yum_wrapper']['vistacore']['name']}-Base.repo", "#{node['yum_wrapper']['vistacore']['name']}-Extras.repo", "#{node['yum_wrapper']['vistacore']['name']}-Updates.repo"]).each{ |repo|
	yum_repository repo.split(".repo")[0] do
	  enabled false
	end
}
