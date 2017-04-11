require 'chef/mixin/shell_out'
require 'chef/provisioning/driver'
require 'chef/provisioning/machine/windows_machine'
require 'chef/provisioning/machine/unix_machine'
require 'chef/provisioning/convergence_strategy/install_msi'
require 'chef/provisioning/convergence_strategy/install_cached'
require 'chef/provisioning/transport/winrm'
require 'chef/provisioning/transport/ssh'
require 'chef/provisioning/vagrant_driver/version'
require 'chef/resource/vagrant_cluster'
require 'chef/provider/vagrant_cluster'

class Chef
  module Provisioning
    module VagrantDriver
      class Driver < Chef::Provisioning::Driver
        include Chef::Mixin::ShellOut

        def create_vm_file(action_handler, vm_name, vm_file_path, machine_options)
          # Determine contents of vm file
          vm_file_content = "Vagrant.configure('2') do |outer_config|\n"
          vm_file_content << "  outer_config.vm.define #{vm_name.inspect} do |config|\n"
          merged_vagrant_options = { 'vm.hostname' => vm_name }
          if machine_options[:vagrant_options]
            merged_vagrant_options = Cheffish::MergedConfig.new(machine_options[:vagrant_options], merged_vagrant_options)
          end
          merged_vagrant_options.each_pair do |key, value|
            case key.to_s
            when 'vm.network'
              value.each_pair { |type, options|
                vm_file_content << "    config.#{key.to_s}(#{type.to_s.inspect}, #{options.inspect})\n"
              }
            when 'vm.provider'
              value.each_pair { |type, options|
                vm_file_content << "    config.#{key.to_s} #{type.inspect} do |v| \n"
                options.each_pair { |provider_key, provider_value|
                  vm_file_content << "      v.#{provider_key.to_s} = #{provider_value.inspect}\n"
                }
                vm_file_content << "    end\n"
              }
            when 'vm.synced_folder'
              value.each { |options|
                vm_file_content << "    config.#{key.to_s}(#{options[:host_path].inspect}, #{options[:guest_path].inspect}, #{options.inspect})\n"
              }
            else
              vm_file_content << "    config.#{key.to_s} = #{value.inspect}\n"
            end
          end
          vm_file_content << machine_options[:vagrant_config] if machine_options[:vagrant_config]
          vm_file_content << "  end\nend\n"

          # Set up vagrant file
          Chef::Provisioning.inline_resource(action_handler) do
            file vm_file_path do
              content vm_file_content
              action :create
            end
          end
        end

      end
    end
  end
end
