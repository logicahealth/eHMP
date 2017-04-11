require 'chef/provisioning/convergence_strategy/precreate_chef_objects'
require 'pathname'
require 'mixlib/install'

class Chef
module Provisioning
  class ConvergenceStrategy
    class InstallSh < PrecreateChefObjects

      def setup_convergence(action_handler, machine)
        super

        opts = {"prerelease" => prerelease}
        if convergence_options[:bootstrap_proxy]
          opts["http_proxy"] = convergence_options[:bootstrap_proxy]
          opts["https_proxy"] = convergence_options[:bootstrap_proxy]
        end

        if convergence_options[:install_sh_arguments]
          opts['install_flags'] = convergence_options[:install_sh_arguments]
        end

        opts["omnibus_url"] = convergence_options[:install_sh_url] if convergence_options[:install_sh_url]

        install_command = Mixlib::Install.new(chef_version, false, opts).install_command
        machine.write_file(action_handler, install_sh_path, install_command, :ensure_dir => true)
        machine.set_attributes(action_handler, install_sh_path, :mode => '0755')
        machine.execute(action_handler, "sh -c #{install_sh_path}")
      end

    end
  end
end
end
