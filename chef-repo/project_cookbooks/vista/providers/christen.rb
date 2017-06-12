#
# Cookbook Name:: vista
# Resource:: christen_execute
#
# christen a domain for mailman setup
#

action :execute do
  chef_gem "greenletters"
  require "greenletters"

  ruby_block "christen:christen:#{new_resource}" do
    block do
      console = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => node[:vista][:shell_timeout_seconds])

      # start the shell, set up cache environment and start cache shell
      console.start!
      console.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
        process.write("#{node[:vista][:session]}\n")
      end

      # Change namespace
    if node[:vista][:install_cache]
      console.wait_for(:output, /USER>/) do | process, match |
        process.write("ZN \"#{node[:vista][:namespace]}\"\n")
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

      console.write("d ^XUP\n")

      console.wait_for(:output, /OPTION NAME:/i)
      console.write("CHRISTEN A DOMAIN\n")

      console.wait_for(:output, /Are you sure you want to change the name of this facility/i)
      console.write("YES\n")

      console.wait_for(:output, /Select DOMAIN NAME:/i)
      console.write("\n")

      console.wait_for(:output, /PARENT:/i)
      console.write("\n")


      console.wait_for(:output, /TIME ZONE:/i)
      console.write("\n")
    end
  end
end

