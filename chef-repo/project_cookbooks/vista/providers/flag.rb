#
# Cookbook Name:: vista
# Resource:: flag
#
# create a flag for a patient
#

action :create do
  chef_gem "greenletters"
  require "greenletters"

  ruby_block "flag:create:#{new_resource}" do
    block do
      Chef::Log.info("Making a flag for #{new_resource.patient}")
      console = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => node[:vista][:shell_timeout_seconds])

      console.on(:output, /Type <Enter> to continue or '\^' to exit/i) do |process, match_data|
        console.write("\n")
      end

      console.on(:output, /Are you sure you wish to continue/i) do |process, match_data|
        console.write("YES\n")
      end

      # start the shell, set up cache environment and start cache shell
      console.start!
      console.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
        process.write("#{node[:vista][:session]}\n")
      end

      # Change namespace
      console.wait_for(:output, /USER>/) do | process, match |
        process.write("ZN \"#{new_resource.namespace}\"\n")
      end

      if new_resource.programmer_mode
        # Set user and setup programmer environment
        console.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
          process.write("S DUZ=#{new_resource.duz}\r")
          process.write("D ^XUP\r")
        end
      end

      console.wait_for(:output, /OPTION NAME:/i)
      console.write("DGPF RECORD FLAG ASSIGNMENT\n")

      console.wait_for(:output, /Select Action/i)
      console.write("sp\r")

      console.wait_for(:output, /PATIENT NAME:/i)
      console.write("#{new_resource.patient}\n")

      console.wait_for(:output, /Select Action/i)
      console.write("af\r")

      console.wait_for(:output, /Select a flag for this assignment/i)
      console.write("wan\n")

      console.wait_for(:output, /...OK?/i)
      console.write("\n")

      console.wait_for(:output, /Enter Owner Site/i)
      console.write("\n")

      console.wait_for(:output, /Approved By/i)
      console.write("provider,one\n")

      console.wait_for(:output, /CHOOSE/i)
      console.write("1\n")

      console.wait_for(:output, /1>/i)
      console.write("test flag\n")

      console.wait_for(:output, /2>/i)
      console.write("\n")

      console.wait_for(:output, /EDIT Option/i)
      console.write("\n")

      console.wait_for(:output, /Enter Review Date/i)
      console.write("\n")

      console.wait_for(:output, /Do you want to review again/i)
      console.write("\n")

      console.wait_for(:output, /Would you like to file this new record flag assignment/i)
      console.write("\n")

      # console.wait_for(:output, /Select Action/i)
      # console.write("quit\r")

    end
  end
end

