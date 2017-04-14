#
# Cookbook Name:: cache
# Resource:: ro_install
#
# This provider uses greenletters and PTY to automate install prompts. This can cause odd character output to :log.
#
#

action :execute do

  chef_gem "greenletters"
  require "greenletters"
  require "uri"

  # Determine type of source
  case new_resource.source
  when /^\/.*/
    # if source is local resource, then use as-is
    source_file = new_resource.source
  when /^#{URI.regexp}$/
    # if source is URI, then download to cache
    filename =  new_resource.source.split("/")[-1]
    remote_file "#{Chef::Config[:file_cache_path]}/#{filename}" do
      source new_resource.source
    end
    source_file = "#{Chef::Config[:file_cache_path]}/#{filename}"
  else
    # otherwise, assume it is a cookbook_file
    filename = new_resource.source
    cookbook_file filename do
      path "#{Chef::Config[:file_cache_path]}/#{filename}"
      action :create
    end
    source_file = "#{Chef::Config[:file_cache_path]}/#{filename}"
  end

  ruby_block "ro_install:execute" do
    block do
      shell = Greenletters::Process.new(node[:jds][:shell], :transcript => new_resource.log, :timeout => 10)
      prompt = /#{new_resource.namespace}>/

      # For non-standard RO files, accept and log.
      shell.on(:output, /Override and use this File with %RI\? No =>/) do | process, match |
        Chef::Log.info("Non-standard RO found. Proceeding with install.")
        process.write("yes\r")
      end
      shell.on(:output, /Please enter a number from the above list: <0>/) do | process, match |
        Chef::Log.info("Non-standard RO found. Treating as Cache RO.")
        process.write("0\r")
      end

      # start the shell
      shell.start!

      # Start Cache session
      shell.wait_for(:output, node[:jds][:shell_prompt]) do | process, match |
        process.write("#{node[:jds][:session]}\r")
      end

      # Login
      if new_resource.cache_username != nil
        shell.on(:output, /Username/) do | process, match |
          process.write("#{new_resource.cache_username}\r")
        end
      end

      if new_resource.cache_password != nil
        shell.on(:output, /Password/) do | process, match |
          process.write("#{new_resource.cache_password}\r")
        end
      end

      # Change namespace
      shell.wait_for(:output, /USER>/) do | process, match |
        process.write("ZN \"#{new_resource.namespace}\"\r")
      end

      # Set user and setup programmer environment
      shell.wait_for(:output, prompt) do | process, match |
        process.write("D ^%RI\r")
      end
      shell.wait_for(:output, /Device:/) do | process, match |
        process.write("#{source_file}\r")
      end
      shell.wait_for(:output, /Parameters/) do | process, match |
        process.write("\r")
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
        process.write("h\r")
      end

      shell.wait_for(:output, node[:jds][:shell_prompt]) do | process, match |
        process.write("exit\r")
      end
      shell.wait_for(:exit)
    end
  end
end
