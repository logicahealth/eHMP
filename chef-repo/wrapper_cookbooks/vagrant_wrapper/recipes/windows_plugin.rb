#
# Cookbook Name:: vagrant_wrapper
# Recipe:: windows_plugin
#

# Create the "sourced" VAGRANT_HOME if its not there
directory node[:vagrant_wrapper][:home]

# Instead of installing nokogiri using the `gem install` option, 
# use the directory in this cookbook to copy the gems into vagrant_home
# and then install the vagrant-windows plugin on top of that
remote_directory "#{node[:vagrant_wrapper][:home]}" do
  source '.vagrant.d'
end

# Using the plugin resource defined in the vagrant cookbook,
# this will install the vagrant-windows plugin 
ENV['VAGRANT_HOME'] = node[:vagrant_wrapper][:home]
vagrant_plugin "vagrant-windows" do
  version "1.6.0"
  action :install
end

# Since the workstation cookbook is run with root privileges, the permissions should 
# be changed back to the sudo_user
execute 'correct permissions since vagrant_plugin does not' do
  command "chown -R #{ENV['SUDO_USER']} #{node[:vagrant_wrapper][:home]}"
  action :run
end

execute 'ensure the gems directory is writable' do
  command "chmod -R 0755 #{node[:vagrant_wrapper][:home]}"
  action :run
end

