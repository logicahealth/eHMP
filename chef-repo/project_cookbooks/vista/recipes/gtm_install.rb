#
# Cookbook Name:: vista
# Recipe:: gtm
#

# Create directory used to download GT.M installer
directory node[:vista][:installer_dir] do
  mode "0755"
  recursive true
end

# Create user that is used to run the GT.M listeners
user node[:vista][:gtm_user] do
  action :create
end

group node[:vista][:gtm_user] do
  action :create
  members 'vagrant'
  append true
end

# Copy gtminstall script to installation directory
remote_file "#{node[:vista][:installer_dir]}/gtminstall" do
  source node[:vista][:gtm_source]
  owner 'root'
  group 'root'
  mode '0755'
end

# Ensure Wget is the latest cuz sf.net is now https and wget didn't know how to
# deal with the wildcart cert
yum_package 'wget' do
  action :upgrade
end

# Install GT.M via installer
execute "Install GT.M" do
  command "#{node[:vista][:installer_dir]}/gtminstall #{node[:vista][:gtm_version]}"
end
