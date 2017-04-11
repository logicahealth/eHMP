require 'chef/mixin/shell_out'
require 'chef/provisioning/driver'
require 'chef/provisioning/machine/windows_machine'
require 'chef/provisioning/machine/unix_machine'
require 'chef/provisioning/convergence_strategy/install_msi'
require 'chef/provisioning/convergence_strategy/install_sh'
require 'chef/provisioning/transport/winrm'
require 'chef/provisioning/transport/ssh'
require 'chef/provisioning/vagrant_driver/version'
require 'chef/resource/vagrant_cluster'
require 'chef/provider/vagrant_cluster'

class Chef
  module Provisioning
    module VagrantDriver
      # Provisions machines in vagrant.
      class Driver < Chef::Provisioning::Driver

        include Chef::Mixin::ShellOut

        def convergence_strategy_for(machine_spec, machine_options)
          if machine_spec.location['vm.guest'].to_s == 'windows'
            Chef::Provisioning::ConvergenceStrategy::InstallMsi.new(machine_options[:convergence_options], config)
          else
            Chef::Provisioning::ConvergenceStrategy::InstallSh.new(machine_options[:convergence_options], config)
          end
        end

        # This method adds a 4th parameter to the WinRM initialization below
        def create_winrm_transport(machine_spec)
          forwarded_ports = machine_spec.location['forwarded_ports']

          # TODO IPv6 loopback?  What do we do for that?
          hostname = machine_spec.location['winrm.host'] || '127.0.0.1'
          port = machine_spec.location['winrm.port'] || 5985
          port = forwarded_ports[port] if forwarded_ports[port]
          endpoint = "http://#{hostname}:#{port}/wsman"
          type = :plaintext
          options = {
            :user => machine_spec.location['winrm.username'] || 'vagrant',
            :pass => machine_spec.location['winrm.password'] || 'vagrant',
            :disable_sspi => true
          }

          # As modified by PR #37 in chef-provisioning-vagrant, commit 8f20f8c6f28557749d96c59d9e2dd96275df4659
          ChefMetal::Transport::WinRM.new(endpoint, type, options, config)
        end
      end
    end
  end
end
