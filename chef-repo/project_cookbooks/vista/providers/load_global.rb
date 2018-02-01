#
# Cookbook Name:: vista
# Resource:: install_distribution
#
# This provider uses greenletters and PTY to automate install prompts. This can cause odd character output to :log.
#
#

action :install do

  require 'greenletters'
  require 'uri'
  require 'json'

  manifest = JSON.parse(IO.read(new_resource.manifest_path))
  distributions = Array.new(manifest[new_resource.patch_list])

  distributions.each do |source|
    
    filename =  source.split("/")[-1]
    Chef::Log.info("Loading Distribution: #{filename}")

    # convert line endings
    bash "dos2unix #{filename}" do
      cwd Chef::Config[:file_cache_path]
      code <<-EOH
        dos2unix #{filename}
        EOH
    end

    shell = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => 60)

    # If distribution was previously installed, "OK to continue with Load? NO//" will be asked before checking distribution
    shell.on(:output, /OK to continue with Load\? NO/) do | process, match |
      process.write("Yes\n")
      Chef::Log.info("Distribution was previously loaded and installed.")
    end

    # Add non-blocking trigger for Environment Check Routine
    shell.on(:output, /Want to RUN the Environment Check Routine\?/) do | process, match |
      process.write("Yes\n")
    end

    # Install Questions for vista packages can occur out of order
    shell.on(:output, /Want KIDS to Rebuild Menu Trees Upon Completion of Install\?/) do | process, match |
      process.write("No\n")
    end
    shell.on(:output, /Want KIDS to INHIBIT LOGONs during the install\?/) do | process, match |
      process.write("No\n")
    end
    shell.on(:output, /Want to DISABLE Scheduled Options, Menu Options, and Protocols\?/) do | process, match |
      process.write("No\n")
    end

    # install questions to which we respond with the default
    shell.on(:output, /Enter the Coordinator for Mail Group '.*':/) do | process, match |
      process.write("\n")
    end

    shell.start!
    shell << "#{node[:vista][:session]}\n"

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
    shell.wait_for(:output, /Select OPTION NAME:/) do | process, match |
      process.write("XPD LOAD DISTRIBUTION\n")
    end
    shell.wait_for(:output, /Enter a Host File:/) do | process, match |
      process.write("#{Chef::Config[:file_cache_path]}/#{filename}\n")
    end

    shell.wait_for(:output, /Want to Continue with Load\?/) do | process, match |
      process.write("Yes\n")
    end

    shell.wait_for(:output, /Globals will now be installed, OK\?/) do | process, match |
      process.write("Yes\n")
    end
    shell.wait_for(:output, /VISTA>/) do | process, match |
      process.write("h\n")
    end
    shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
      process.write("exit\n")
    end
    shell.wait_for(:exit)

    Chef::Log.info("Loaded Distribution: #{filename}")
  end
end
