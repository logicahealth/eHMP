#
# Cookbook Name:: vista
# Resource:: xpar_edit
#
# This provider uses greenletters and PTY to automate install prompts. This can cause odd character output to :log.
#

action :do do
  chef_gem "greenletters"
  require "greenletters"

  ruby_block "xpar_edit::#{new_resource.parameter_definition_name}::#{new_resource.name}" do
    block do
      begin
        shell = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => node[:vista][:shell_timeout_seconds])

        # start the shell, set up GTM environment and start GTM shell
        shell.start!
        shell << "#{node[:vista][:session]}\n"

        # Change namespace
        shell.wait_for(:output, /USER>/) do | process, match |
          process.write("ZN \"#{node[:vista][:namespace]}\"\n")
        end

        # Set user to administrator and setup programmer environment
        shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
          process.write("S DUZ=1 D ^XUP\n")
        end

        shell.on(:output, /Do you really want to halt\? YES/) do | process, match |
          Chef::Log.info("Non-blocking trigger matched output: #{match[0]}\n")
          process.write("\r")
          process.write("h\r")
          process.write("exit\r")
          shell.wait_for(:exit)
        end

        shell.wait_for(:output, /Select OPTION NAME:/)
        shell << "XPAR EDIT PARAMETER\r"
        shell.wait_for(:output, /Select PARAMETER DEFINITION NAME:/)
        shell << "#{new_resource.parameter_definition_name}\r"
        shell.wait_for(:output, /Select [a-zA-Z]+:Version:/)
        shell << "#{new_resource.name}\r"
        # shell.wait_for(:output, /[a-zA-Z]+:Version: #{new_resource.name}/)
        # If Application doesn't exist in menu, then "Are you adding VITALS.EXE:5.0.18.1 as a new Application:Version? Yes//" will be displayed
        # shell << "\r"

        new_entry = false
        shell.wait_for(:output, /Are you/) do | process, match |
          Chef::Log.info("#{new_resource.name} does not exist in #{new_resource.parameter_definition_name}")
          new_entry = true
          shell << "\r"
        end

        shell.wait_for(:output, /[a-zA-Z]+:Version: #{new_resource.name}/)
        shell << "\r"

        shell.wait_for(:output, /(Yes\/No:)|(Compatible with current server version:)/i) do | process, match |
          process.write("Yes\r")
          Chef::Log.info("#{new_resource.name} compatibility added.")
        end

        # Returning to 'Select General Parameter Tools Option:' prompt is necessary to save changes
        shell.wait_for(:output, /Select [a-zA-Z]+:Version:/) do | process, match |
          process.write("\r")
        end
        shell.wait_for(:output, /Select PARAMETER DEFINITION NAME:/) do | process, match |
          process.write("\r")
        end
        shell << "h\r"
        shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
          process.write("exit\n")
        end
        shell.wait_for(:exit)
      rescue Exception
        Chef::Log.info("Timeout; killing shell.")
        Chef::Log.debug($ERROR_INFO)
        Chef::Log.debug($ERROR_POSITION)
        shell.kill!
      end
    end # block
  end # ruby_block

end
