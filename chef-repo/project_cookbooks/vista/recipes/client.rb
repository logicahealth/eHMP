#
# Cookbook Name:: vista
# Recipe:: client
#

# Add all nodes for the local copies of the vista sites
vista_sites = find_multiple_nodes_by_role("vista-.*", node[:stack])
# If deploying the vista-client with no local vista sites deployed, add
# this bogus domain to ensure the shortcuts are created
if vista_sites.size == 0
  vista_sites.push(
    {
      "ipaddress" => "IP        "
    },
    {
      "ipaddress" => "IP        "
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

# Download and Install Visual C++ 2008
remote_file "#{Chef::Config[:file_cache_path]}/#{File.basename(node[:vista][:client][:visual_studio][:x86][:url])}" do
  source node[:vista][:client][:visual_studio][:x86][:url]
  action :create
  notifies :run, 'execute[install visual C++ 32-bit]', :immediately
end

execute "install visual C++ 32-bit" do
  command "#{File.basename(node[:vista][:client][:visual_studio][:x86][:url])} /qn"
  cwd Chef::Config[:file_cache_path]
  action :nothing
end

remote_file "#{Chef::Config[:file_cache_path]}/#{File.basename(node[:vista][:client][:visual_studio][:x64][:url])}" do
  source node[:vista][:client][:visual_studio][:x64][:url]
  action :create
  notifies :run, 'execute[install visual C++ 64-bit]', :immediately
end

execute "install visual C++ 64-bit" do
  command "#{File.basename(node[:vista][:client][:visual_studio][:x64][:url])} /qn"
  cwd Chef::Config[:file_cache_path]
  action :nothing
end

# Download and Install Cache Studio
remote_file "#{Chef::Config[:file_cache_path]}/#{File.basename(node[:vista][:client][:studio][:url])}" do
  source node[:vista][:client][:studio][:url]
  action :create
end

# See documentation on silent install at http://docs.intersystems.com/cache20151/csp/docbook/DocBook.UI.Page.cls?KEY=GCI_windows#GCI_windows_silentinst_run
execute "install cache cube" do
  command "#{File.basename(node[:vista][:client][:studio][:url])} /instance TRYCACHE /qn ADDLOCAL=cube,studio"
  cwd Chef::Config[:file_cache_path]
  not_if { ::File.directory?("C:\\InterSystems") }
end

remote_file "#{Chef::Config[:file_cache_path]}/vergence-desktop-component-#{node[:vista][:vault][:version]}.zip" do
  source node[:vista][:vault][:url]
  action :create
end

# Place Vergence Desktop Compnent Installers
windows_zipfile "c:/Program Files (x86)/Sentillion" do
  source "#{Chef::Config[:file_cache_path]}/vergence-desktop-component-#{node[:vista][:vault][:version]}.zip"
  overwrite true
  action :unzip
end
