#
# Cookbook Name:: jds
# Resource:: ro_install
#
# This provider uses greenletters and PTY to automate install prompts. This can cause odd character output to :log.
#
#

action :execute do

  chef_gem "greenletters"
  require "greenletters"

  ruby_block "ro_install:execute" do
    block do
      shell = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => 10)
      prompt = /#{new_resource.namespace}>/

      # start the shell, set up GTM environment and start GTM shell
      shell.start!
      shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
        process.write("#{node[:jds][:session]}\n")
      end

      # Change namespace
      shell.wait_for(:output, /USER>/) do | process, match |
        process.write("ZN \"#{new_resource.namespace}\"\n")
      end

      # Set user and setup programmer environment
      shell.wait_for(:output, prompt) do | process, match |
        process.write("D ^%RI\r")
      end
      shell.wait_for(:output, /Device:/) do | process, match |
        process.write("#{new_resource.source}\r")
      end
      shell.wait_for(:output, /Parameters/) do | process, match |
        process.write("\r")
      end
      shell.wait_for(:output, /Override/) do | process, match |
        process.write("Yes\r")
      end
      shell.wait_for(:output, /UNKNOWN mode/) do | process, match |
        process.write("0\r")
      end
      shell.wait_for(:output, /Routine Input Option:/) do | process, match |
        process.write("All Routines\r")
      end
      shell.wait_for(:output, /shall it replace the one on file/) do | process, match |
        process.write("yes\r")
      end
      shell.wait_for(:output, /Recompile/) do | process, match |
        process.write("yes\r")
      end
      shell.wait_for(:output, /Display Syntax Errors/) do | process, match |
        process.write("Yes\r")
      end
      shell.wait_for(:output, prompt) do | process, match |
        process.write("h\n")
      end

      shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
        process.write("exit\n")
      end
      shell.wait_for(:exit)
    end # end block
  end # end ruby_block
end
