#
# Cookbook Name:: jds
# Recipe:: gtm
#

# Create directory used to download GT.M installer
directory node[:jds][:installer_dir] do
  mode "0755"
  recursive true
  action :nothing
end

# Create user that is used to run the GT.M listeners
user node[:jds][:gtm_user] do
  action :create
end

# Copy gtminstall script to installation directory
remote_file "#{node[:jds][:installer_dir]}/gtminstall" do
  notifies :delete, "directory[#{node[:jds][:installer_dir]}]", :before
  notifies :create, "directory[#{node[:jds][:installer_dir]}]", :before
  source node[:jds][:gtm_source]
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
  command "#{node[:jds][:installer_dir]}/gtminstall #{node[:jds][:gtm_version]}"
end
