#
# Cookbook Name:: git_wrapper
# Recipe:: default
#


# I don't know why this doesn't work in the attributes for the workstation cookbook
# But it works here
case node['platform_family']
when 'mac_os_x'
  node.default['git']['osx_dmg']['url']  = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/program/git/git-osx/1.9.5/git-osx-1.9.5-leopard.dmg"
when 'rhel'
  node.default['git']['url'] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/program/git/git/1.9.5.tar/git-1.9.5.tar.gz"
end
  
include_recipe "git"
