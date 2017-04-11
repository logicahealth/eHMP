#
# Cookbook Name:: jds
# Resource:: security_block
#
# This provider uses greenletters and PTY to automate install prompts. This can cause odd character output to :log.
#
# Set database security parameters including enabling encryption of audit trail

action :execute do

  chef_gem 'greenletters'
  require 'greenletters'

  ruby_block "routine_block:execute:securityblock" do
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
          Chef::Log.info("Import security settings - Started SECURITY routine")
        end

        shell.wait_for(:output, /Option\?/) do | process, match |
          process.write("12\r")
          Chef::Log.info("Seleced \"12) System parameter setup\"")
        end

        # Import security settings from XML template file to enable auditng and encryption of CACHE_AUDIT
        shell.wait_for(:output, /Option\?/) do | process, match |
          process.write("6\r")
          Chef::Log.info("Selected \"6) Import All Security settings\"")
        end

        shell.wait_for(:output, /Import from file name/) do | process, match |
          process.write("#{node[:jds][:cache_mgr_dir]}/EncryptAudit.xml\r")
          Chef::Log.info("File to import:  \"#{node[:jds][:cache_mgr_dir]}/EncryptAudit.xml\"")
        end
        shell.wait_for(:output, /Parameters\?/) do | process, match |
          process.write("\r")
          Chef::Log.info("Accepted default parameter")
        end
        shell.wait_for(:output, /Import ALL security records\?/) do | process, match |
          process.write("Yes\r")
          Chef::Log.info("Entered user name")
        end
        shell.wait_for(:output, /Confirm import of security records from #{node[:jds][:cache_mgr_dir]}\/EncryptAudit.xml/) do | process, match |
          process.write("Yes\r")
          Chef::Log.info("Confirm import")
        end

        # Import security settings from XML template file to conform to VA security standards
        # There is one setting that cannot be set with the XML file; remove role %All from UnknownUser
        #   That change will be perfomred using the menu system following the XML import
        shell.wait_for(:output, /Option\?/) do | process, match |
          process.write("6\r")
          Chef::Log.info("Selected \"6) Import All Security settings\"")
        end

        shell.wait_for(:output, /Import from file name/) do | process, match |
          process.write("#{node[:jds][:cache_mgr_dir]}/SecureConfiguration.xml\r")
          Chef::Log.info("File to import:  \"#{node[:jds][:cache_mgr_dir]}/SecureConfiguration.xml\"")
        end
        shell.wait_for(:output, /Parameters\?/) do | process, match |
          process.write("\r")
          Chef::Log.info("Accepted default parameter")
        end
        shell.wait_for(:output, /Import ALL security records\?/) do | process, match |
          process.write("Yes\r")
          Chef::Log.info("Entered user name")
        end
        shell.wait_for(:output, /Confirm import of security records from #{node[:jds][:cache_mgr_dir]}\/SecureConfiguration.xml/) do | process, match |
          process.write("Yes\r")
          Chef::Log.info("Confirm import")
        end
        shell.wait_for(:output, /Option\?/) do | process, match |
          process.write("7\r")
          Chef::Log.info("Finished with \"System parameter setup - import from XML file\"")
        end

        # All done, exit SECURITY module
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
        Chef::Log.error("Security settings import aborted due to unexpected output.")
        Chef::Log.error(e.message)
      end
    end
  end
end
