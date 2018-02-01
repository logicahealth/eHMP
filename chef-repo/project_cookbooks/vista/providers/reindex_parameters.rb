#
# Cookbook Name:: vista
# Resource:: reindex_parameters
#
# reindexs the PARAMETERS vista file
#

action :execute do
  chef_gem "greenletters"
  require "greenletters"

  ruby_block "reindex_parameters:execute:#{new_resource}" do
    block do
      Chef::Log.info("reindexing the PARAMETERS vista file")
      console = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => node[:vista][:shell_timeout_seconds])


      # start the shell, set up cache environment and start cache shell
      console.start!
      console.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
        process.write("#{node[:vista][:session]}\n")
      end

      # Change namespace
      if node[:vista][:install_cache]
        console.wait_for(:output, /USER>/) do | process, match |
          process.write("ZN \"#{new_resource.namespace}\"\n")
        end
      end

      if new_resource.programmer_mode
        # Set user and setup programmer environment
        console.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
          process.write("S DUZ=#{new_resource.duz}\r")
          if new_resource.programmer_mode
            process.write("D ^XUP\r")
            process.write("^\r")
          end
        end
      end

      console.wait_for(:output, /VISTA>/i)
      console << "d P^DI\n"

      console.wait_for(:output, /Select OPTION/i)
      console << "UTILITY FUNCTIONS\n"

      console.wait_for(:output, /Select UTILITY OPTION/i)
      console << "RE-INDEX FILE\n"

      console.wait_for(:output, /MODIFY WHAT FILE/i)
      console << "PARAMETERS\n"

      console.wait_for(:output, /DO YOU WISH TO RE-CROSS-REFERENCE ONE PARTICULAR INDEX/i)
      console << "Y\n"

      console.wait_for(:output, /Select FIELD/i)
      console << ".01\n"

      console.wait_for(:output, /WANT TO RE-CROSS-REFERENCE ONE OF THEM/i)
      console << "Y\n"

      console.wait_for(:output, /WHICH NUMBER/i)
      console << "2\n"

      console.wait_for(:output, /RE YOU SURE YOU WANT TO DELETE AND RE-CROSS-REFERENCE/i)
      console << "Y\n"

      console.wait_for(:output, /DONE!/i)
    end
  end
end

