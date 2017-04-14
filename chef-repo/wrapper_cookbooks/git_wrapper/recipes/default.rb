#
# Cookbook Name:: git_wrapper
# Recipe:: default
#

# I don't know why this doesn't work in the attributes for the workstation cookbook
# But it works here
case node['platform_family']
when 'mac_os_x'
  node.default['git']['osx_dmg']['url']  = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/git/git-osx/2.9.2/git-osx-2.9.2-mavericks.dmg"
  node.default['git']['osx_dmg']['app_name']    = 'git-2.9.2-intel-universal-mavericks'
  node.default['git']['osx_dmg']['volumes_dir'] = 'Git 2.9.2 Mavericks Intel Universal'
  node.default['git']['osx_dmg']['package_id']  = 'git-2.9.2-intel-universal-mavericks.pkg'
  node.default['git']['osx_dmg']['checksum']    = 'e56eb565a0b46827174efadf21b2df71a559df7d279da3f60e907eb196f5e519'
when 'rhel'
  node.default['git']['url'] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/git/git/1.9.5.tar/git-1.9.5.tar.gz"
  node.default['git']['checksum'] = '0f30984828d573da01d9f8e78210d5f4c56da1697fd6d278bad4cfa4c22ba271'
end

include_recipe "git"
