#
# Cookbook Name:: git_wrapper
# Attributes:: default
#
#

case node['platform_family']
when 'mac_os_x'
  default['git']['osx_dmg']['url']         = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/git/git-osx/1.9.5/git-osx-1.9.5-leopard.dmg"
  default['git']['osx_dmg']['checksum']    = '61b8a9fda547725f6f0996c3d39a62ec3334e4c28a458574bc2aea356ebe94a1'
else
  default['git']['version'] = '1.9.5'
  default['git']['url'] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/git/git/1.9.5.tar/git-1.9.5.tar.gz"
  default['git']['checksum'] = '0f30984828d573da01d9f8e78210d5f4c56da1697fd6d278bad4cfa4c22ba271'
end
