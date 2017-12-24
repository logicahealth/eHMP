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
    distribution_name = ""

    # convert line endings
    bash "dos2unix #{filename}" do
      cwd Chef::Config[:file_cache_path]
      code <<-EOH
        dos2unix #{filename}
        EOH
    end

    shell = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => 60)

    #
    # Add non-blocking triggers to support idempotency
    #

    # If distribution was previously installed, "OK to continue with Load? NO//" will be asked before checking distribution
    shell.on(:output, /OK to continue with Load\? NO/) do | process, match |
      process.write("Yes\n")
      Chef::Log.info("Distribution was previously loaded and installed.")
    end

    shell.on(:output, /Type <Enter> to continue or '\^' to exit/) do | process, match |
      process.write("\n")
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
    shell.wait_for(:output, /USER>/) do | process, match |
      process.write("ZN \"#{node[:vista][:namespace]}\"\n")
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

    # EXPECTED OUTPUT:
    # This Distribution contains Transport Globals for the following Package(s):
    #   VPR 1.0
    # Distribution OK!
    shell.wait_for(:output, /Want to Continue with Load\?/) do | process, match |
      process.write("Yes\n")
    end

    # EXPECTED OUTPUT:
    # Use INSTALL NAME: VPR 1.0 to install this Distribution.
    shell.wait_for(:output, /Use INSTALL NAME: .* to install this Distribution./) do | process, match |
      distribution_name = match[0][18..match[0].index(" to install this Distribution") - 1]
    end

    Chef::Log.info("Distribution Loaded: #{distribution_name}")


    if new_resource.run_checksums
      #running checksuom and transport global checks

      Chef::Log.info("Running checksums: #{distribution_name}")

      release = node.name
      formated_dist_name = distribution_name.gsub(/\*/, '_')
      log_name = "/vagrant/#{release}_#{formated_dist_name}"

      shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
        process.write("S DUZ=1 D ^XUP\n")
      end
      shell.wait_for(:output, /Select OPTION NAME:/) do | process, match |
        process.write("XPD PRINT CHECKSUM\n")
      end
      shell.wait_for(:output, /Select INSTALL NAME:/) do | process, match |
        process.write("#{distribution_name}\n")
      end

      shell.wait_for(:output, /Want each Routine Listed with Checksums/) do | process, match |
        process.write("YES\n")
      end

      shell.wait_for(:output, /DEVICE/) do | process, match |
        process.write("HFS\n")
      end

      shell.wait_for(:output, /HOST FILE NAME/) do | process, match |
        process.write("#{log_name}_compare2current.log\n")
      end

      shell.wait_for(:output, /ADDRESS/) do | process, match |
        process.write("\n")
      end



      shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
        process.write("S DUZ=1 D ^XUP\n")
      end

      shell.wait_for(:output, /Select OPTION NAME:/) do | process, match |
        process.write("XPD COMPARE TO SYSTEM\n")
      end

      shell.wait_for(:output, /Select INSTALL NAME:/) do | process, match |
        process.write("#{distribution_name}\n")
      end

      shell.wait_for(:output, /Type of Compare:/) do | process, match |
        process.write("1\n")
      end

      shell.wait_for(:output, /DEVICE/) do | process, match |
        process.write("HFS\n")
      end

      shell.wait_for(:output, /HOST FILE NAME/) do | process, match |
        process.write("#{log_name}_verifyChecksums.log\n")
      end

      shell.wait_for(:output, /ADDRESS/) do | process, match |
        process.write("\n")
      end
    end

    shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
      process.write("S DUZ=1 D ^XUP\n")
    end
    shell.wait_for(:output, /Select OPTION NAME:/) do | process, match |
      process.write("XPD INSTALL BUILD\n")
    end
    shell.wait_for(:output, /Select INSTALL NAME:/) do | process, match |
      process.write("#{distribution_name}\n")
    end

    # Install Questions will be prompted at this point

    shell.wait_for(:output, /DEVICE:/) do | process, match |
      process.write("0;p-other;80;99999\n")
    end
    shell.on(:output, /#{node[:vista][:prompt]}/) do | process, match |
      new_resource.updated_by_last_action(true)
      Chef::Log.info("Install Completed: #{distribution_name}\n")
      process.write("h\n")
    end
    shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
      process.write("exit\n")
    end
    shell.wait_for(:exit)

  end
end
