#
# Cookbook Name:: vista
# Resource:: appointment_create
#
# Creates appointments for a given patient
#

action :create do
  chef_gem "greenletters"
  require "greenletters"

  ruby_block "appointment:create:#{new_resource}" do
    block do
      Chef::Log.info("Making appointment for #{new_resource.patient} at #{new_resource.clinic} #{new_resource.day} from today")
      console = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => node[:vista][:shell_timeout_seconds])

      console.on(:output, /DISPLAY PENDING APPOINTMENTS/i) do |process, match_data|
        console.write("n\n")
      end

      console.on(:output, /Are you sure you want to continue connecting/i) do |process, match_data|
        console.write("YES\n")
      end

      console.on(:output, /ISSUE REQUEST FOR RECORDS/i) do |process, match_data|
        console.write("NO\n")
      end

      console.on(:output, /RESULTS SENT TO CLINIC/i) do |process, match_data|
        console.write("\n")
      end

      console.on(:output, /DO YOU WANT TO CANCEL IT/i) do |process, match_data|
        console.write("y\n")
      end

      console.on(:output, /CHOOSE 1/i) do |process, match_data|
        console.write("1\n")
      end

      console.on(:output, /CHECKED-IN/i) do |process, match_data|
        console.write("\n")
      end

      console.on(:output, /Check out date/i) do |process, match_data|
        console.write("^\n")
      end

      console.on(:output, /PRE-APPOINTMENT LETTER/i) do |process, match_data|
        console.write("NO\n")
      end

      console.on(:output, /IS THIS CORRECT/i) do |process, match_data|
        console.write("\n")
      end

      console.on(:output, /OR EKG STOPS/i) do |process, match_data|
        console.write("\n")
      end

      console.on(:output, /OTHER INFO/i) do |process, match_data|
        console.write("\n")
      end

      console.on(:output, /PATIENT ALREADY HAS APPOINTMENT ON THE SAME DAY/i) do |process, match_data|
        console.write("\n")
      end

      console.on(:output, /Select ETHNICITY:/i) do |process, match_data|
        console.write("\n")
      end

      console.on(:output, /Select RACE:/i) do |process, match_data|
        console.write("\n")
      end

      console.on(:output, /Select LANGUAGE DATE\/TIME:/i) do |process, match_data|
        console.write("N\n")
      end

      console.on(:output, /PREFERRED LANGUAGE:.*/i) do |process, match_data|
        console.write("\n")
      end

      console.on(:output, /ARE YOU SURE THAT YOU WANT TO PROCEED/i) do |process, match_data|
        console.write("YES\n")
      end

      console.on(:output, /LENGTH OF APPOINTMENT/i) do |process, match_data|
        console.write("\n")
      end

      console.on(:output, /Check out date and time/i) do |process, match_data|
        console.write("^\n")
      end

      console.on(:output, /Review active orders/i) do |process, match_data|
        console.write("\n")
      end

      console.on(:output, /There is no availability for this date/i) do |process, match_data|
        # no_availability = true
        # console.kill!
        console.unblock!
      end

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
      console.write("MAS MASTER MENU\n")

      console.wait_for(:output, /Scheduling Manager's Menu/i)
      console.write("Scheduling Manager's Menu\n")

      console.wait_for(:output, /Appointment Menu/i)
      console.write("appointment Menu\n")

      console.wait_for(:output, /to stop:/i)
      console.write("\n")

      console.wait_for(:output, /Option:/i)
      console.write("Make Appointment\n")

      console.wait_for(:output, /select CLINIC:/i)
      console.write("#{new_resource.clinic}\n")

      console.wait_for(:output, /PATIENT NAME:/i)
      console.write("#{new_resource.patient}\n")

      console.wait_for(:output, /APPOINTMENT TYPE:/i)
      console.write("\n")

      console.wait_for(:output, /NEXT AVAILABLE/i)
      console.write("y\n")

      console.wait_for(:output, /TIME:/i)

      if new_resource.day < 0
        console.write("T#{new_resource.day}@#{new_resource.time}\n")
      elsif new_resource.day == 0
        console.write("T@#{new_resource.time}\n")
      else
        console.write("T+#{new_resource.day}@#{new_resource.time}\n")
      end


      begin
        console.wait_for(:output, /select CLINIC:/i)
        console.write("^\n")
        console.wait_for(:output, /to continue/i)
        console.write("^\n")
        console.wait_for(:output, /Option:/i)
        console.write("HALT\n")
        console.wait_for(:output, /sh-[0-9\.]+#/)
        console.write("exit\n")
        console.wait_for(:exit)
      rescue => error
        Chef::Log.warn("making appointments failed with error: #{error}")
      end
    end
  end
end

