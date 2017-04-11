#
# Cookbook Name:: vista
# Resource:: fileman
#
# This provider uses greenletters to automate the MUMPS Global Import utility, ^%GI.
#

require 'rubygems'

def replace_datestring(contents)

  date = DateTime.now
  start_date = date.strftime("3%y%m%d")

  contents = contents.gsub(/\{today\}/, start_date)
  regex = /\{today(?<sign>[+-])(?<day>\d*)(?<inverse>[I])?\}/

  contents = contents.gsub(regex){ |match|
    sign = match.gsub(regex, '\k<sign>')
    day = match.gsub(regex, '\k<day>')
    inverse = match.gsub(regex, '\k<inverse>')

    if sign == '-'
      new_date = date - day.to_i
    else
      new_date = date + day.to_i
    end

    formatted_new_date = new_date.strftime("3%y%m%d")

    if inverse == 'I'
      return_value = (9999998 - formatted_new_date.to_i).to_s
    else
      return_value = formatted_new_date
    end

    return_value
  }
end

def build_file(file_path)
  require 'date'

  file = IO::File.open(file_path, "r+")
  contents = file.read

  contents = replace_datestring(contents)

  file.truncate(0)
  file.write contents
  file.close
end

action :create do
  chef_gem "greenletters"
  require "greenletters"

  ruby_block "global_import_utility:#{new_resource.import_file}" do

    build_file(new_resource.import_file)

    block do
      shell = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => 60)
      shell.start!
      shell << "#{node[:vista][:session]}\n"

      # Change namespace
      shell.wait_for(:output, /USER>/) do | process, match |
        process.write("ZN \"#{node[:vista][:namespace]}\"\n")
      end

      if new_resource.programmer_mode
        # Set user and setup programmer environment
        shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
          process.write("S DUZ=#{new_resource.duz}\r")
          if new_resource.programmer_mode
            process.write("D ^XUP\r")
            process.write("^\r")
          end
        end
      end

      # Delete existing cross-references
      new_resource.dik_da_pairs.each do | dik_da |
        shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
          process.write("S DIK=\"#{dik_da[0]}\",DA=\"#{dik_da[1]}\" D IX2^DIK\n")
        end
      end

      shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
        process.write("D ^%GI\n")
      end

      shell.wait_for(:output, /Device:/) do | process, match |
        process.write("#{new_resource.import_file}\n")
      end

      shell.wait_for(:output, /Parameters\? "R" => /) do | process, match |
        process.write("\n")
      end

      shell.wait_for(:output, /Input option:/) do | process, match |
        process.write("A\n")
      end

      # Reindex new values
      new_resource.dik_da_pairs.each do | dik_da |
        shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
          process.write("S DIK=\"#{dik_da[0]}\",DA=\"#{dik_da[1]}\" D IX^DIK\n")
        end
      end

      shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
        process.write("h\n")
        process.write("exit\n")
      end
    end
  end # ruby_block
end # end :create
