#
# Cookbook Name:: astronaut
# Resource:: reindex_file
#
# This provider uses greenletters and PTY to automate install prompts. This can cause odd character output to :log.
#
# ############# Equivalent Terminal Commands #############
#
# ASTRON>D Q^DI
#
# MSC FileMan 22.1043
#
# Select OPTION: UTILITY FUNCTIONS
# Select UTILITY OPTION: RE-INDEX FILE
#
# Modify what File: RPC BROKER SITE PARAMETERS// #{file}
#                                           (1 entry)
#
# THERE ARE 14 INDICES WITHIN THIS FILE
# DO YOU WISH TO RE-CROSS-REFERENCE ONE PARTICULAR INDEX? No//   (No)
# OK, ARE YOU SURE YOU WANT TO KILL OFF THE EXISTING 14 INDICES? No// Y  (Yes)
# DO YOU THEN WANT TO 'RE-CROSS-REFERENCE'? Yes// Y  (Yes)
# ...HMMM, I'M WORKING AS FAST AS I CAN...
# FILE WILL NOW BE 'RE-CROSS-REFERENCED'.................
#

action :create do
  chef_gem "greenletters"
  require "greenletters"

  ruby_block "reindex_file:#{new_resource.file}" do
    block do
      # Override default timeout; this process may take a long time
      shell = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => 30)

      # start the shell, set up cache environment and start cache shell
      shell.start!
      shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
        process.write("#{node[:vista][:session]}\n")
      end

      # Change namespace
    if node[:vista][:install_cache]
      shell.wait_for(:output, /USER>/) do | process, match |
        process.write("ZN \"#{node[:vista][:namespace]}\"\n")
      end
    end

      # Set user to administrator and fileman prompt
      shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
        process.write("S DUZ=1\r")
        process.write("D Q^DI\r")
      end

      shell.wait_for(:output, /Select OPTION:/)
      shell << "UTILITY FUNCTIONS\r"

      shell.wait_for(:output, /Select UTILITY OPTION:/)
      shell << "RE-INDEX FILE\r"

      shell.wait_for(:output, /MODIFY WHAT FILE:.*/i) do | process, match |
        Chef::Log.debug("Selecting file: " + new_resource.file)
        process.write("#{new_resource.file}\r")
      end

      shell.wait_for(:output, /DO YOU WISH TO RE-CROSS-REFERENCE ONE PARTICULAR INDEX\?/)
      shell << "No\r"

      shell.wait_for(:output, /OK, ARE YOU SURE YOU WANT TO KILL OFF THE EXISTING \d+ INDICES\?/)
      shell << "Yes\r"

      shell.wait_for(:output, /DO YOU THEN WANT TO 'RE-CROSS-REFERENCE'\?/)
      shell << "Yes\r"

      shell.wait_for(:output, /Select UTILITY OPTION:/) do | process, match |
        process.write("\r")
        process.write("\r")
      end

      shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
        process.write("h\n")
      end

      shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
        process.write("exit\n")
      end
      shell.wait_for(:exit)
    end # block
  end # ruby_block
end # end :create
