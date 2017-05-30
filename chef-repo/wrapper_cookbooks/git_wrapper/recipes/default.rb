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
  include_recipe "git"
when 'rhel'
  node.default['git']['version'] = '2.12.0'
  node.default['git']['url'] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/git/git/#{node[:git][:version]}/git-#{node[:git][:version]}.tar.gz"
  node.default['git']['checksum'] = '882f298daf582a07c597737eb4bbafb82c6208fe0e73c047defc12169c221a92'
  include_recipe "git::source"
end
