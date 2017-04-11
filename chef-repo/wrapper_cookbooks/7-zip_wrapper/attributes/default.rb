#
# Cookbook Name:: 7-zip_wrapper
# Attributes:: default
#
#


if kernel['machine'] =~ /x86_64/
  default['7-zip']['url']          = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/7zip/7z-x64/9.22/7z-x64-9.22.msi"
  default['7-zip']['checksum']     = "f09bf515289eea45185a4cc673e3bbc18ce608c55b4cf96e77833435c9cdf3dc"
  default['7-zip']['package_name'] = "7-Zip 9.22 (x64 edition)"
end
