#
# Cookbook Name:: cache
# Resource:: mumps_block
#
# This provider uses greenletters and PTY to automate install prompts. This can cause odd character output to :log.
#

action :nothing do
end

action :execute do

  chef_gem "greenletters"
  require "greenletters"

  ruby_block "mumps_block:execute:#{new_resource.command.hash}" do
    block do
      shell = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => node[:jds][:shell_timeout_seconds])

      # start the shell, set up cache environment and start cache shell
      shell.start!
      shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
        process.write("#{node[:jds][:session]}\n")
      end

      # Change namespace
      shell.wait_for(:output, /USER>/) do | process, match |
        process.write("ZN \"#{new_resource.namespace}\"\n")
      end

      if new_resource.programmer_mode
        # Set user and setup programmer environment
        shell.wait_for(:output, /#{node[:jds][:prompt]}/) do | process, match |
          process.write("S DUZ=#{new_resource.duz}\r")
          if new_resource.programmer_mode
            process.write("D ^XUP\r")
            process.write("^\r")
          end
        end
      end

      prompt = /#{new_resource.namespace}>/
      new_resource.command.each do |resource_command|
        shell.wait_for(:output, prompt) do | process, match |
          process.write(resource_command)
          process.write("\r")
        end
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
