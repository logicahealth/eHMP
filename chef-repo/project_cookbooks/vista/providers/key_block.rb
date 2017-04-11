#
# Cookbook Name:: vista
# Resource:: key_block
#
# This provider uses greenletters and PTY to automate install prompts. This can cause odd character output to :log.
#
# Activate a key to encrypt the database
# Set up unattended database encryptioon, also enable encryption of journal files and CacheTemp

action :execute do

  require 'greenletters'

  cache_key_pw = Chef::EncryptedDataBagItem.load("credentials", "vista_cache_key_password", node[:data_bag_string])["password"]

  ruby_block "key_block:execute:#{new_resource.command.hash}" do
    block do
      begin

        shell = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => node[:vista][:shell_timeout_seconds])

        # start the shell, set up cache environment and start cache shell
        shell.start!
        shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
          process.write("#{node[:vista][:session]}\n")
        end

        # Change namespace
        shell.wait_for(:output, /USER>/) do | process, match |
          process.write("ZN \"%SYS\"\n")
        end

        shell.wait_for(:output, /%SYS>/) do | process, match |
          process.write("D ^SECURITY\n")
          Chef::Log.info("Activate encryption key - Started SECURITY routine")
        end

        shell.wait_for(:output, /Option\?/) do | process, match |
          process.write("11\n")
          Chef::Log.info("Seleced \"11\) Encryption key setup\"")
        end

        shell.wait_for(:output, /Select option:/) do | process, match |
          process.write("3\n")
          Chef::Log.info("Selected \"3\) Database encryption\"")
        end

        shell.wait_for(:output, /Select option:/) do | process, match |
          process.write("1\n")
        end
        shell.wait_for(:output, /Database encryption key file:/) do | process, match |
          process.write("#{node[:vista][:cache_mgr_dir]}/#{node[:vista][:cache_key_file]}\n")
        end
        shell.wait_for(:output, /Username:/) do | process, match |
          process.write("#{node[:vista][:cache_key_user]}\n")
        end
        shell.wait_for(:output, /Password:/) do | process, match |
          process.write("#{cache_key_pw}\n")
          Chef::Log.info("Entered password")
        end
        shell.wait_for(:output, /Database encryption key activated./) do | process, match |
          Chef::Log.info("Result: :output")
        end

        shell.wait_for(:output, /Select option:/) do | process, match |
          process.write("4\n")
          Chef::Log.info("Selected \"4) Configure Cache startup options\"")
        end
        shell.wait_for(:output, /Option:/) do | process, match |
          process.write("3\n")
          Chef::Log.info("Seleced \"3) Unattended database encryption key activation at startup\"")
        end
        shell.wait_for(:output, /Unattended activation key file:/) do | process, match |
          process.write("#{node[:vista][:cache_mgr_dir]}/#{node[:vista][:cache_key_file]}\n")
        end
        shell.wait_for(:output, /Encrypt journal files\?/) do | process, match |
          process.write("Yes\n")
        end
        shell.wait_for(:output, /Encrypt CacheTemp\?/) do | process, match |
          process.write("Yes\n")
        end
        shell.wait_for(:output, /Username:/) do | process, match |
          process.write("#{node[:vista][:cache_key_user]}\n")
        end
        shell.wait_for(:output, /Password:/) do | process, match |
          process.write("#{cache_key_pw}\n")
        end

        shell.wait_for(:output, /Key file is now enabled for unattended database encryption key activation at startup./) do | process, match |
          Chef::Log.info(:output)
        end

        shell.wait_for(:output, /Option:/) do | process, match |
          process.write("4\n")
        end
        shell.wait_for(:output, /Unattended database encryption key activation at startup:/) do | process, match |
          Chef::Log.info(:output)
        end

        shell.wait_for(:output, /Option:/) do | process, match |
          process.write("^\n")
          Chef::Log.info("Finished with \"Configure Cache startup options\"")
        end

        shell.wait_for(:output, /Select option:/) do | process, match |
          process.write("^\n")
          Chef::Log.info("Finished with \"Database encryption\"")
        end

        shell.wait_for(:output, /Select option:/) do | process, match |
          process.write("^\n")
          Chef::Log.info("Finished with \"Encryption key setup\"")
        end

        shell.wait_for(:output, /Option\?/) do | process, match |
          process.write("14\n")
          Chef::Log.info("Exiting SECURITY routine")
        end

        shell.wait_for(:output, /%SYS>/) do | process, match |
          process.write("h\n")
          Chef::Log.info("Exiting csession")
        end

        shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
          process.write("exit\n")
        end

        shell.wait_for(:exit)
      rescue RuntimeError => e
        Chef::Log.error("Key configuration aborted due to unexpected output.")
        Chef::Log.error(e.message)
      end
    end # end block
  end # end ruby_block
end
