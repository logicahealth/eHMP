#
# Cookbook Name:: vista
# Resource:: fileman
#
# This provider uses greenletters and PTY to automate install prompts. This can cause odd character output to :log.
#
# .01 must be a field in field_values
# If /.*:\/\// is encountered during input, it is assumed correct
#

action :create do
  chef_gem "greenletters"
  require "greenletters"

  ruby_block "fileman:#{new_resource.file}:#{new_resource.field_values.hash}" do
    block do
      begin
        shell = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => node[:vista][:shell_timeout_seconds])

        shell.on(:output, /STORE THESE FIELDS IN TEMPLATE:/) do | process, match |
          process.write("\r")
        end

        shell.on(:output, /Are you adding .+ as\s+a new .+ \(the .*\)\?/im) do | process, match |
          process.write("Yes\r")
        end

        # start the shell, set up cache environment and start cache shell
        shell.start!
        shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
          process.write("#{node[:vista][:session]}\n")
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
        shell.wait_for(:output, /Select OPTION NAME:/)
        shell << "DIEDIT\r"

        shell.wait_for(:output, /INPUT TO WHAT FILE:/i) do | process, match |
          Chef::Log.debug("Selecting file: " + new_resource.file)
          process.write("#{new_resource.file}\r")
        end

        field_prompt_regex = /EDIT WHICH FIELD:/i
        new_resource.field_values.each_key do | field |
          shell.wait_for(:output, field_prompt_regex) do | process, match |
            process.write("#{field}\r")
          end
          field_prompt_regex = /THEN EDIT FIELD:/i
        end

        # Done adding fields to edit
        shell.wait_for(:output, field_prompt_regex) do | process, match |
          process.write("\r")
        end

        # If the prompt is a confirmation prompt, the provider will respond with \r
        # If the file being entered is not an existing file, that confirmation prompt
        # means we need to retry the current value (since we responded with \r, rather than the value)
        value_prompt_regex =  /Select.+: $/i
        confirmation_prompt_regex = /:.+\/\//m
        ok_prompt_regex = /\.\.\.OK\? Yes\/\//
        index = 0
        field_values_array = new_resource.field_values.to_a
        existing_entry = false
        while index < field_values_array.size
          field_value = field_values_array[index]
          Chef::Log.debug(index.to_s + ":" + field_value[0] + ":" + field_value[1])
          do_retry = false
          shell.wait_for(:output, Regexp.union(confirmation_prompt_regex, value_prompt_regex, ok_prompt_regex)) do | process, match |
            if confirmation_prompt_regex =~ match[0] || ok_prompt_regex =~ match[0]
              Chef::Log.debug("Confirmation prompt matched: " + match[0].to_s)
              process.write("\r")
              if index == 1     # if confirmation was on second prompt, then it is an existing file, and every field will be have //
                Chef::Log.debug("Confirmation prompt; existing entry.")
                existing_entry = true
                process.write("\r")   # we still need to advance the next prompt
              end
              unless existing_entry
                Chef::Log.debug("Confirmation prompt; retry needed")
                do_retry = true     # if not first prompt, then it was a confirmation prompt, and we need to retry entering the field
              end
            else
              process.write("#{field_value[1]}\r")
            end
          end
          value_prompt_regex =  /.+: $/
          if do_retry == false
            # Using retry in a ruby_block causes:
            # DEBUG: Line number of compile error: '0'
            # DEBUG: Re-raising exception: TypeError - can't convert nil into String
            index += 1
          end
        end  # end while

        shell.wait_for(:output, /Select.+:/i) do | process, match |
          process.write("\r")
        end
        shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
          process.write("h\n")
        end
        shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
          process.write("exit\n")
        end
        shell.wait_for(:exit)

      rescue Exception
        Chef::Log.info("Timeout; killing shell.")
        Chef::Log.debug($ERROR_INFO)
        Chef::Log.debug($ERROR_POSITION)
        shell.kill!
      end
    end # block
  end # ruby_block
end # end :create

action :update do
  chef_gem "greenletters"
  require "greenletters"

  ruby_block "fileman:#{new_resource.file}:#{new_resource.field_values.hash}" do
    block do
      begin
        shell = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => node[:vista][:shell_timeout_seconds])

        # start the shell, set up cache environment and start cache shell
        shell.start!
        shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
          process.write("#{node[:vista][:session]}\n")
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
        shell.wait_for(:output, /Select OPTION NAME:/)
        shell << "DIEDIT\r"

        shell.wait_for(:output, /INPUT TO WHAT FILE:/i) do | process, match |
          Chef::Log.debug("Selecting file: " + new_resource.file)
          process.write("#{new_resource.file}\r")
        end

        field_prompt_regex = /EDIT WHICH FIELD:/i
        new_resource.field_values.each_key do | field |
          shell.wait_for(:output, field_prompt_regex) do | process, match |
            process.write("#{field}\r")
          end
          field_prompt_regex = /THEN EDIT FIELD:/i
        end

        # Done adding fields to edit
        shell.wait_for(:output, field_prompt_regex) do | process, match |
          process.write("\r")
        end

        value_prompt_regex =  /Select.+: $/i
        index = 0
        field_values_array = new_resource.field_values.to_a
        while index < field_values_array.size
          field_value = field_values_array[index]
          Chef::Log.debug(index.to_s + ":" + field_value[0] + ":" + field_value[1][0])
          field = field_value[0]
          escape=["/", ".", "^", "$"] #list of character to escape
          escape.each {|char| field= field.gsub(char,"\\#{char}")}
          edit_prompt_regex = /#{field}: .+/i
          do_retry = false
          shell.wait_for(:output, Regexp.union(value_prompt_regex,edit_prompt_regex)) do | process, match |
            if edit_prompt_regex =~ match[0]
              process.write("#{field_value[1][1]}\r")
              index += 1
            else
              process.write("#{field_value[1][0]}\r")
            end
          end
        end  # end while

        shell.wait_for(:output, /Select.+:/i) do | process, match |
          process.write("\r")
        end
        shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
          process.write("h\n")
        end
        shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
          process.write("exit\n")
        end
        shell.wait_for(:exit)

      rescue Exception
        Chef::Log.info("Timeout; killing shell.")
        Chef::Log.debug($ERROR_INFO)
        Chef::Log.debug($ERROR_POSITION)
        shell.kill!
      end
    end # block
  end # ruby_block
end # end :update
