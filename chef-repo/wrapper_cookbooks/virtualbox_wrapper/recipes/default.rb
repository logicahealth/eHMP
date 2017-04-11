#
# Cookbook Name:: java_wrapper
# Recipe:: default
#

case node['platform_family']
when 'mac_os_x'
  node.normal['virtualbox']['url'] = "http://download.virtualbox.org/virtualbox/4.3.30/VirtualBox-4.3.30-101610-OSX.dmg"

  ruby_block "verify VMs are shut off" do
    block do
      raise "\n\n\n\nVirtualBox is attempting to upgrade, but has failed due to running VMs.\n
Action Item:  Using gradle, please stop all VMs.  Then, run configure_workspace.sh again\n\n\n\n" unless `ps aux | pgrep VBox`.chomp == ""
    end
    only_if { File.exists?("/Applications/VirtualBox.app") && !`vboxmanage --version`.include?("4.3.30") }
    notifies :delete, "directory[/Applications/VirtualBox.app]", :immediately
  end
  
  directory "/Applications/VirtualBox.app" do
  	recursive true
		action :nothing
	end
end

include_recipe "virtualbox"
