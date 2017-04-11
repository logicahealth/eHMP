#
# Cookbook Name:: vista
# Recipe:: client
#

include_recipe "windows"

# Add all nodes for the local copies of the vista sites
vista_sites = find_multiple_nodes_by_role("vista-.*", node[:stack])
# If deploying the vista-client with no local vista sites deployed, add
# this bogus domain to ensure the shortcuts are created
if vista_sites.size == 0
  vista_sites.push(
    {
      "ipaddress" => "IP_ADDRESS"
    },
    {
      "ipaddress" => "IP_ADDRESS"
    }
  )
end

# workaround for error: "Chef::Exceptions::EnclosingDirectoryDoesNotExist: Parent directory C:/opscode/chef/cache does not exist"
directory Chef::Config[:file_cache_path] do
  action :create
end

remote_file "#{Chef::Config[:file_cache_path]}/vista-clients-#{node[:vista][:client][:version]}.zip" do
  source node[:vista][:client][:url]
  action :create
end

# Install VistA GUI clients
node.normal[:windows][:rubyzipversion] = '1.0.0'
windows_zipfile "c:/Program Files (x86)" do
  source "#{Chef::Config[:file_cache_path]}/vista-clients-#{node[:vista][:client][:version]}.zip"
  overwrite true
  action :unzip
end

# Create VistA GUI clients links
# Use a custom resource here to ensure the CPRS versions exist when compiling the shortcut resources
vista_client_shortcuts "create shortcuts on Desktop for each CPRS component" do
  sites vista_sites
  action :execute
end

# Download and Install Cache Studio
remote_file "#{Chef::Config[:file_cache_path]}/#{File.basename(node[:vista][:client][:studio][:url])}" do
  source node[:vista][:client][:studio][:url]
  action :create
end

# See documentation on silent install at http://docs.intersystems.com/cache20151/csp/docbook/DocBook.UI.Page.cls?KEY=GCI_windows#GCI_windows_silentinst_run
windows_batch 'install cache cube' do
  code "#{Chef::Config[:file_cache_path]}/#{File.basename(node[:vista][:client][:studio][:url])} /instance TRYCACHE /qn ADDLOCAL=cube,studio"
end
