#
# Cookbook Name:: machine
# Recipe:: cprs-local
#

require 'chef/provisioning/vagrant_driver'
require 'chef/mixin/shell_out'
with_driver 'vagrant'

windows_box = "windows7pro-base-2.6"
windows_box_url = "#{node[:common][:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/vagrant/basebox/windows7pro-base/2.6/windows7pro-base-2.6.box"
box_timeout = 3600
if `vagrant box list | grep #{windows_box}` == ""
  puts "download #{windows_box} vagrant box... this may take a while"
  shell_out("vagrant box add #{windows_box} #{windows_box_url}", :timeout => box_timeout)
end

# Provisioning machines using WinRM is only supported if deploying against a chef-sever
# Local mode does not work
with_chef_server 'https://pantry.vistacore.us/organizations/vistacore',
  :client_name => Chef::Config[:node_name],
  :signing_key_filename => Chef::Config[:client_key]

machine_opts = {
  :vagrant_options => {
    'vm.box' => "windows7pro-base-2.6",
    'vm.guest' => :windows,
    'winrm.guest_port' => 5985,
    'windows.set_work_network' => true,
    'vm.network' => {
      'private_network' => {
        :ip => "IPADDRES"
      },
      :forwarded_port =>  {
        guest: 5985,
        host: 5985,
        id: "winrm",
        auto_correct: true
      }
    },
    'vm.provider' => {
      "virtualbox" => {
        :name => "cprs-#{ENV['USER']}",
        :gui => true
      }
    }
  },
  :convergence_options => {
    :install_msi_url => "#{node[:common][:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/chef/chef-client/12.3.0/chef-client-12.3.0.msi"
  }
}

ehmp_deps = parse_dependency_versions "ehmp_provision"

r_list = []
r_list << "recipe[vista::client@#{ehmp_deps["vista"]}]"

machine "cprs-#{ENV['USER']}" do
  machine_options machine_opts
  attributes(
    stack: node[:machine][:stack],
    nexus_url: node[:common][:nexus_url],
    data_bag_string: node[:common][:data_bag_string]
  )
  converge node[:machine][:converge]
  run_list r_list
  chef_environment node[:machine][:environment]
  action node[:machine][:action]
end
