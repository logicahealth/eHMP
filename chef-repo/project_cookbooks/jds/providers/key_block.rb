#
# Cookbook Name:: jds
# Resource:: key_block
#
# This provider uses greenletters and PTY to automate install prompts. This can cause odd character output to :log.
#
# Activate a key to encrypt the database
# Set up unattended database encryptioon, also enable encryption of journal files and CacheTemp

action :execute do

  require 'greenletters'

  ruby_block "key_block:execute:keyblock" do
    block do
      begin

        shell = Greenletters::Process.new(node[:jds][:shell], :transcript => new_resource.log, :timeout => node[:jds][:shell_timeout_seconds])

        # start the shell
        shell.start!

        # Start Cache session
        shell.wait_for(:output, node[:jds][:shell_prompt]) do | process, match |
          process.write("#{node[:jds][:session]}\r")
        end

        # Login
        if new_resource.cache_username != nil
          shell.wait_for(:output, /Username/) do | process, match |
            process.write("#{new_resource.cache_username}\r")
          end
        end

        if new_resource.cache_password != nil
          shell.wait_for(:output, /Password/) do | process, match |
            process.write("#{new_resource.cache_password}\r")
          end
        end

        # Change namespace
        shell.wait_for(:output, /USER>/) do | process, match |
          process.write("ZN \"%SYS\"\r")
        end

        shell.wait_for(:output, /%SYS>/) do | process, match |
          process.write("D ^SECURITY\r")
          Chef::Log.info("Activate encryption key - Started SECURITY routine")
        end

        shell.wait_for(:output, /Option\?/) do | process, match |
          process.write("11\r")
          Chef::Log.info("Seleced \"11\) Encryption key setup\"")
        end

        shell.wait_for(:output, /Select option:/) do | process, match |
          process.write("3\r")
          Chef::Log.info("Selected \"3\) Database encryption\"")
        end

        shell.wait_for(:output, /Select option:/) do | process, match |
          process.write("1\r")
        end
        shell.wait_for(:output, /Database encryption key file:/) do | process, match |
          process.write("#{node[:jds][:cache_mgr_dir]}/#{node[:jds][:cache_key_file]}\r")
        end
        shell.wait_for(:output, /Username:/) do | process, match |
          process.write("#{node[:jds][:cache_key_user]}\r")
        end
        shell.wait_for(:output, /Password:/) do | process, match |
          process.write("#{node[:jds][:cache_key_pw]}\r")
          Chef::Log.info("Entered password")
        end
        shell.wait_for(:output, /Database encryption key activated./) do | process, match |
          Chef::Log.info("Result: :output")
        end

        shell.wait_for(:output, /Select option:/) do | process, match |
          process.write("4\r")
          Chef::Log.info("Selected \"4) Configure Cache startup options\"")
        end
        shell.wait_for(:output, /Option:/) do | process, match |
          process.write("3\r")
          Chef::Log.info("Seleced \"3) Unattended database encryption key activation at startup\"")
        end
        shell.wait_for(:output, /Unattended activation key file:/) do | process, match |
          process.write("#{node[:jds][:cache_mgr_dir]}/#{node[:jds][:cache_key_file]}\r")
        end
        shell.wait_for(:output, /Encrypt journal files\?/) do | process, match |
          process.write("Yes\r")
        end
        shell.wait_for(:output, /Encrypt CacheTemp\?/) do | process, match |
          process.write("Yes\r")
        end
        shell.wait_for(:output, /Username:/) do | process, match |
          process.write("#{node[:jds][:cache_key_user]}\r")
        end
        shell.wait_for(:output, /Password:/) do | process, match |
          process.write("#{node[:jds][:cache_key_pw]}\r")
        end

        shell.wait_for(:output, /Key file is now enabled for unattended database encryption key activation at startup./) do | process, match |
          Chef::Log.info(:output)
        end

        shell.wait_for(:output, /Option:/) do | process, match |
          process.write("4\r")
        end
        shell.wait_for(:output, /Unattended database encryption key activation at startup:/) do | process, match |
          Chef::Log.info(:output)
        end

        shell.wait_for(:output, /Option:/) do | process, match |
          process.write("^\r")
          Chef::Log.info("Finished with \"Configure Cache startup options\"")
        end

        shell.wait_for(:output, /Select option:/) do | process, match |
          process.write("^\r")
          Chef::Log.info("Finished with \"Database encryption\"")
        end

        shell.wait_for(:output, /Select option:/) do | process, match |
          process.write("^\r")
          Chef::Log.info("Finished with \"Encryption key setup\"")
        end

        shell.wait_for(:output, /Option\?/) do | process, match |
          process.write("14\r")
          Chef::Log.info("Exiting SECURITY routine")
        end

        shell.wait_for(:output, /%SYS>/) do | process, match |
          process.write("h\r")
          Chef::Log.info("Exiting csession")
        end

        shell.wait_for(:output, node[:jds][:shell_prompt]) do | process, match |
          process.write("exit\r")
        end

        shell.wait_for(:exit)
      rescue RuntimeError => e
        Chef::Log.error("Key configuration aborted due to unexpected output.")
        Chef::Log.error(e.message)
      end
    end
  end
end
