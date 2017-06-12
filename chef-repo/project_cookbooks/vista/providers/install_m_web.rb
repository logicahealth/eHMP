#
# Cookbook Name:: vista
# Resource:: install_m_web
#
# This provider uses greenletters and PTY to automate install prompts. This can cause odd character output to :log.
#
#

action :execute do

  chef_gem "greenletters"
  require "greenletters"

  ruby_block "install_m_web:execute" do
    block do
      begin
        shell = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => 10)

        # start the shell, set up GTM environment and start GTM shell
        shell.start!
        # Curl
        shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
          process.write("curl https://raw.github.com/shabiel/M-Web-Server/0.1.1/dist/WWWINIT.RSA > /tmp/WWWINIT.RSA\n")
        end
        shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
          process.write("#{node[:vista][:session]}\n")
        end

        # Change namespace
        if node[:vista][:install_cache]
          shell.wait_for(:output, /USER>/) do | process, match |
            process.write("ZN \"#{node[:vista][:namespace]}\"\n")
          end
        end

        # Set user and setup programmer environment
        shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
          process.write("D ^%RI\r")
        end
        shell.wait_for(:output, /Device:/) do | process, match |
          process.write("/tmp/WWWINIT.RSA\r")
        end
        shell.wait_for(:output, /Parameters/) do | process, match |
          process.write("\r")
        end
        shell.wait_for(:output, /Override and use this File with/) do | process, match |
          process.write("yes\r")
        end
        shell.wait_for(:output, /Please enter a number from the above list:/) do | process, match |
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
        shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
          process.write("D ^WWWINIT\r")
        end
        shell.wait_for(:output, /Enter Directory:/) do | process, match |
          process.write("\r")
        end
        shell.wait_for(:output, /Enter a port number between 1024 and 65535:/) do | process, match |
          process.write("9211\r")
        end
        shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
          process.write("h\n")
        end

        shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
          process.write("exit\n")
        end
        shell.wait_for(:exit)
      rescue RuntimeError => e
        Chef::Log.error("Install aborted due to unexpected output.")
        Chef::Log.error(e.message)
      end
    end # end block
  end # end ruby_block
end
