#
# Cookbook Name:: vista
# Resource:: allergy_eie
#
# This provider uses greenletters and PTY to automate prompts. This can cause odd character output to :log.
#

action :update do

  chef_gem "greenletters"
  require "greenletters"

  ruby_block "allergy_eie:#{new_resource.full_name}:#{new_resource.eie_allowed}" do
    block do
      shell = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => node[:vista][:shell_timeout_seconds])

      # start the shell, set up GTM environment and start GTM shell
      shell.start!
      shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
        process.write("#{node[:vista][:session]}\r")
      end

      # Change namespace
      if node[:vista][:install_cache]
        shell.wait_for(:output, /USER>/) do | process, match |
          process.write("ZN \"#{node[:vista][:namespace]}\"\n")
        end
      end

      # Set user to administrator and setup programmer environment
      shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
        process.write("S DUZ=1 D ^XUP\n")
      end
      # Exit menu options
      shell.wait_for(:output, /Select OPTION NAME:/)
      shell << "^\r"

      shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
        process.write("D EDITPAR^XPAREDIT(\"OR ALLERGY ENTERED IN ERROR\")\r")
      end

      shell.wait_for(:output, /Enter selection:/) do | process, match |
        process.write("USER\r")
      end

      shell.wait_for(:output, /Select NEW PERSON NAME:/) do | process, match |
        process.write("#{new_resource.full_name}\r")
      end

      shell.wait_for(:output, /Allow marking entry as entered in error: (\w*)/) do | process, match |
        allowed = new_resource.eie_allowed ? "YES" : "NO"
        previous_value = match[1]
        Chef::Log.debug("Old EIE value: #{previous_value}; new value: #{allowed}")
        process.write("#{allowed}\r")
        new_resource.updated_by_last_action(true) unless allowed == previous_value
      end

      shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
        process.write("h\n")
      end

      shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
        process.write("exit\n")
      end
      shell.wait_for(:exit)
    end # end block
  end # end ruby_block
end
