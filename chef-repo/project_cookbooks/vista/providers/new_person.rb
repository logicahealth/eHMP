#
# Cookbook Name:: vista
# Resource:: new_person
#
# This provider uses greenletters and PTY to automate install prompts. This can cause odd character output to :log.
#

# Take a started shell and set up a programmer session in DIEDIT menu to file #200 (NEW PERSON)
def init_shell(shell)
  shell << "#{node[:vista][:session]}\n"

  # SOUNDEX matches will prompt for adding a new user; we will always reply yes.
  shell.on(:output, /Do you still want to add this entry/) do | process, match |
    process.write("Yes\r")
  end

  # if there are more then one screen of SOUNDEX matches
  shell.on(:output, /Type <Enter> to continue or '\^' to exit/) do | process, match |
    process.write("\r")
  end

  # Change namespace
  if node[:vista][:install_cache]
    shell.wait_for(:output, /USER>/) do | process, match |
      process.write("ZN \"#{node[:vista][:namespace]}\"\n")
    end
  end

  # Set user to administrator and setup programmer environment
  shell.wait_for(:output, /#{node[:vista][:gtm_prompt]}/) do | process, match |
    process.write("S DUZ=1 D ^XUP\r")
  end

  shell.wait_for(:output, /Select OPTION NAME:/) do | process, match |
    process.write("DIEDIT\r")
  end
  shell.wait_for(:output, /Input to what File:/i) do | process, match |
    process.write("NEW PERSON\r")
  end
end

# exit the M and Linux shells gracefully
def exit_shell(shell)
  shell.wait_for(:output, /Select NEW PERSON NAME:/) do | process, match |
    process.write("^\r")
  end
  shell.wait_for(:output, /#{node[:vista][:prompt]}/) do | process, match |
    process.write("h\r")
  end
  shell.wait_for(:output, /sh-[0-9\.]+#/) do | process, match |
    process.write("exit\n")
  end
  shell.wait_for(:exit)
end

############################################
# Access and Verify codes cannot be reused, so create must not attempt these steps again.
# There must be a branch based on system state:
# If entry already exists (non-exact name match): NAME: USER,FMQL//
# If entry already exists (exact name match): Select KEY: SC PCMM SETUP//
# If entry does not exist:   Are you adding 'USER,FMQL' as a new NEW PERSON (the 54TH)? No// YES  (Yes)
#             Checking SOUNDEX for matches.
#               USER,NURSE
#               ...
#               USER,PHYSICIAN
#             Do you still want to add this entry: NO//YES
#               NEW PERSON INITIAL: FMQL
#               NEW PERSON MAIL CODE:
############################################
def select_new_person(shell, full_name)
  new_entry_regex = /Are you adding .* as a new NEW PERSON \(the .*\)\?/m
  existing_entry_inexact_regex = /NAME: .*\/\//   # this can be made more precise with /NAME: #{full_name.gsub!(/\s+/, "")\/\//
  existing_entry_exact_regex = /Select /
  new_entry = false

  shell.wait_for(:output, /Select NEW PERSON NAME:/) do | process, match |
    process.write("#{full_name}\r")
  end

  shell.wait_for(:output, Regexp.union(new_entry_regex, existing_entry_inexact_regex, existing_entry_exact_regex)) do | process, match |
    Chef::Log.debug("Matched output: #{match[0]}")
    if new_entry_regex =~ match[0]
      Chef::Log.debug("new_entry_regex matched")
      process.write("Yes\r")
      new_entry = true
    end
    if existing_entry_inexact_regex =~ match[0]
      Chef::Log.debug("existing_entry_inexact_regex matched")
      process.write("\r")
    end
  end
  new_entry
end

def select_primary_menu_option(shell)
  shell.wait_for(:output, Regexp.union(node[:vista][:diedit_initial_field_regex], node[:vista][:diedit_next_field_regex])) do | process, match |
    process.write("201\r")
  end
end

def expect_primary_menu_option(shell, primary_menu_option)
  shell.wait_for(:output, /PRIMARY MENU OPTION:/) do | process, match |
    process.write("#{primary_menu_option}\r")
  end
end

def select_secondary_menu_options(shell)
  shell.wait_for(:output, Regexp.union(node[:vista][:diedit_initial_field_regex], node[:vista][:diedit_next_field_regex])) do | process, match |
    process.write("203\r")
  end
  shell.wait_for(:output, /EDIT WHICH SECONDARY MENU OPTIONS SUB-FIELD:/) do | process, match |
    process.write(".01\r")
  end
  shell.wait_for(:output, /THEN EDIT SECONDARY MENU OPTIONS SUB-FIELD:/) do | process, match |
    process.write("\r")
  end
end

def expect_secondary_menu_options(shell, secondary_menu_options)
  secondary_menu_options.each do | secondary_menu_option |
    shell.wait_for(:output, /SECONDARY MENU OPTIONS:/) do | process, match |
      process.write("#{secondary_menu_option}\r")
    end
    shell.wait_for(:output, /\? No\/\//) do | process, match |
      process.write("Y\r")
    end
  end
  # Done adding SECONDARY MENU OPTIONS
  shell.wait_for(:output, /Select SECONDARY MENU OPTIONS:/) do | process, match |
    process.write("\r")
  end
end

def select_keys(shell)
  shell.wait_for(:output, Regexp.union(node[:vista][:diedit_initial_field_regex], node[:vista][:diedit_next_field_regex])) do | process, match |
    process.write("51\r")
  end
  shell.wait_for(:output, /EDIT WHICH KEYS SUB-FIELD:/) do | process, match |
    process.write("\r")
  end
end

def expect_keys(shell, keys)
  # New key for this user:
  # Select KEY: SC PCMM DELETE
  #   REVIEW DATE: T  (APR 17, 2013)
  # Select KEY:
  #
  # Existing key for this user:
  # Select KEY: SC PCMM SETUP// SC PCMM SETUP
  #     ...OK? Yes//   (Yes)
  #  KEY: SC PCMM SETUP//
  #  REVIEW DATE:  T  (APR 17, 2013)
  #  Select KEY:

  keys.each do | key |
    shell.on(:output, /CHOOSE 1-\d+:/) do | process, match |
      # For ambiguous key names, assumed the first one
      process.write("1\r")
    end
    shell.on(:output, /REVIEW DATE:/) do | process, match |
      # Set review data to today
      process.write("T\r")
    end
    shell.on(:output, /\.\.\.OK\? Yes/) do | process, match |
      process.write("\r")
    end
    shell.on(:output, /KEY: #{key}\/\//) do | process, match |
      process.write("\r")
    end
    shell.wait_for(:output, /KEY:/) do | process, match |
      process.write("#{key}\r")
    end
  end
  # Done adding Keys
  shell.wait_for(:output, /Select KEY:/) do | process, match |
    process.write("\r")
  end
end

def select_cprs_tab(shell)
  shell.wait_for(:output, Regexp.union(node[:vista][:diedit_initial_field_regex], node[:vista][:diedit_next_field_regex])) do | process, match |
    process.write("101.13\r")
  end
  shell.wait_for(:output, /EDIT WHICH CPRS TAB SUB-FIELD:/) do | process, match |
    process.write(".01\r")
  end
  shell.wait_for(:output, /THEN EDIT CPRS TAB SUB-FIELD:/) do | process, match |
    process.write(".02\r")
  end
  shell.wait_for(:output, /THEN EDIT CPRS TAB SUB-FIELD:/) do | process, match |
    process.write("\r")
  end
end

def expect_cprs_tab(shell, cprs_tab)
  shell.on(:output, /Are you adding '#{cprs_tab}' as a new CPRS TAB/) do | process, match |
    process.write("Y\r")
  end
  shell.wait_for(:output, /Select CPRS TAB:/) do | process, match |
    process.write("#{cprs_tab}\r")
  end
  shell.wait_for(:output, /EFFECTIVE DATE:/) do | process, match |
    process.write("T-1\r")
  end
  shell.wait_for(:output, /Select CPRS TAB:/) do | process, match |
    process.write("\r")
  end
end

def select_ssn(shell)
  shell.wait_for(:output, Regexp.union(node[:vista][:diedit_initial_field_regex], node[:vista][:diedit_next_field_regex])) do | process, match |
    process.write("9\r")
  end
end

def expect_ssn(shell, ssn)
  shell.on(:output, /SSN:/) do | process, match |
    process.write("#{ssn}\r")
  end
end

def select_signature(shell)
  shell.wait_for(:output, Regexp.union(node[:vista][:diedit_initial_field_regex], node[:vista][:diedit_next_field_regex])) do | process, match |
    process.write("20.4\r")
  end
end

def expect_signature(shell, signature)
  shell.wait_for(:output, /ELECTRONIC SIGNATURE CODE:/) do | process, match |
    process.write("#{signature}\r")
  end
end

def select_signature_block_title(shell)
  shell.wait_for(:output, Regexp.union(node[:vista][:diedit_initial_field_regex], node[:vista][:diedit_next_field_regex])) do | process, match |
    process.write("20.3\r")
  end
end

def expect_signature_block_title(shell, signature_block_title)
  shell.wait_for(:output, /SIGNATURE BLOCK TITLE:/) do | process, match |
    process.write("#{signature_block_title}\r")
  end
end

def select_authorized_for_med_orders(shell)
  shell.wait_for(:output, Regexp.union(node[:vista][:diedit_initial_field_regex], node[:vista][:diedit_next_field_regex])) do | process, match |
    process.write("53.1\r")
  end
end

def expect_authorized_for_med_orders(shell, authorized)
  shell.wait_for(:output, /AUTHORIZED TO WRITE MED ORDERS:/) do | process, match |
    process.write("#{authorized ? "Yes" : "No"}\r")
  end
end

def select_restrict_patients(shell)
  shell.wait_for(:output, Regexp.union(node[:vista][:diedit_initial_field_regex], node[:vista][:diedit_next_field_regex])) do | process, match |
    process.write("101.01\r")
  end
end

def expect_restrict_patients(shell, restrict_patients)
  shell.on(:output, /RESTRICT PATIENT SELECTION:/) do | process, match |
    process.write("#{restrict_patients ? "Yes" : "No"}\r")
  end
end

def select_service_section(shell)
  shell.wait_for(:output, Regexp.union(node[:vista][:diedit_initial_field_regex], node[:vista][:diedit_next_field_regex])) do | process, match |
    process.write("29\r")
  end
end

def expect_service_section(shell, service_section)
  shell.on(:output, /SERVICE\/SECTION:/) do | process, match |
    process.write("#{service_section}\r")
  end
end


action :create do
  chef_gem "greenletters"
  require "greenletters"

  ruby_block "new_person::create::#{new_resource.full_name}" do
    block do
      begin
        shell = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => node[:vista][:shell_timeout_seconds])

        # start the shell, set up GTM environment and start GTM shell
        shell.start!
        init_shell(shell)

        # edit NAME
        shell.wait_for(:output, /EDIT WHICH FIELD:/) do | process, match |
          process.write(".01\r")
        end
        # edit VERIFY CODE never expires
        shell.wait_for(:output, /THEN EDIT FIELD:/) do | process, match |
          process.write("7.2\r")
        end
        # edit ACCESS CODE
        shell.wait_for(:output, /THEN EDIT FIELD:/) do | process, match |
          process.write("2.1\r")
        end
        # edit VERIFY CODE
        shell.wait_for(:output, /THEN EDIT FIELD:/) do | process, match |
          process.write("11.1\r")
        end
        if new_resource.primary_menu_option
          select_primary_menu_option(shell)
        end
        if new_resource.secondary_menu_options.any?
          select_secondary_menu_options(shell)
        end
        if new_resource.keys.any?
          select_keys(shell)
        end
        if new_resource.cprs_tab
          select_cprs_tab(shell)
        end
        if new_resource.ssn
          select_ssn(shell)
        end
        if new_resource.signature
          select_signature(shell)
        end
        if new_resource.signature_block_title
          select_signature_block_title(shell)
        end
        if new_resource.authorized_for_med_orders
          select_authorized_for_med_orders(shell)
        end
        if new_resource.service_section
          select_service_section(shell)
        end
        select_restrict_patients(shell)

        ######################
        # done specifying edit fields
        ######################
        shell.wait_for(:output, /THEN EDIT FIELD:/) do | process, match |
          process.write("\r")
        end
        shell.wait_for(:output, /STORE THESE FIELDS IN TEMPLATE:/) do | process, match |
          process.write("\r")
        end

        ######################
        # Begin field input
        ######################
        @new_entry = select_new_person(shell, new_resource.full_name)

        if @new_entry == true
          shell.wait_for(:output, /NEW PERSON CITY:/) do | process, match |
            process.write("\r")
          end
          shell.wait_for(:output, /NEW PERSON STATE:/) do | process, match |
            process.write("\r")
          end
          shell.wait_for(:output, /NEW PERSON INITIAL:/) do | process, match |
            if new_resource.initial
              process.write("#{new_resource.initial}\r")
            else
              process.write("\r")
            end
          end
          shell.wait_for(:output, /NEW PERSON MAIL CODE:/) do | process, match |
            process.write("\r")
          end
          shell.on(:output, /VERIFY CODE never expires:/) do | process, match |
            process.write("Yes\r")
          end
          shell.wait_for(:output, /Want to edit ACCESS CODE/) do | process, match |
            process.write("Y\r")
          end
          shell.wait_for(:output, /Enter a new ACCESS CODE <Hidden>:/) do | process, match |
            # CR = \r or \x0D
            # LF = \n or \x0A
            # CRLF = \r\n
            # FF = \f or \x0C
            # VistA expects a CR at the end of password prompts
            process.write("#{new_resource.access_code}\r")
          end
          shell.wait_for(:output, /Please re-type the new code to show that I have it right:/) do | process, match |
            process.write("#{new_resource.access_code}\r")
          end
          shell.wait_for(:output, /Want to edit VERIFY CODE/) do | process, match |
            process.write("Y\r")
          end
          shell.wait_for(:output, /Enter a new VERIFY CODE:/) do | process, match |
            process.write("#{new_resource.verify_code}\r")
          end
          shell.wait_for(:output, /Please re-type the new code to show that I have it right:/) do | process, match |
            process.write("#{new_resource.verify_code}\r")
          end
          if new_resource.primary_menu_option
            expect_primary_menu_option(shell, new_resource.primary_menu_option)
          end
          if new_resource.secondary_menu_options.any?
            expect_secondary_menu_options(shell, new_resource.secondary_menu_options)
          end
          if new_resource.keys.any?
            expect_keys(shell, new_resource.keys)
          end
          if new_resource.cprs_tab
            expect_cprs_tab(shell, new_resource.cprs_tab)
          end
          if new_resource.ssn
            expect_ssn(shell, new_resource.ssn)
          end
          if new_resource.signature
            expect_signature(shell, new_resource.signature)
          end
          if new_resource.signature_block_title
            expect_signature_block_title(shell, new_resource.signature_block_title)
          end
          if new_resource.authorized_for_med_orders
            expect_authorized_for_med_orders(shell, new_resource.authorized_for_med_orders)
          end
          if new_resource.service_section
            expect_service_section(shell, new_resource.service_section)
          end
          expect_restrict_patients(shell, false)

          Chef::Log.info("NEW PERSON (#{new_resource.access_code}) created successfully.\n")
        else    # new_entry == false
          Chef::Log.info("#{new_resource.full_name} already exists. Aborting new_person::create.\n")
          shell.write("^\r")
        end

        exit_shell(shell)
      rescue Exception
        Chef::Log.info("Timeout; killing shell.")
        Chef::Log.debug($ERROR_INFO)
        Chef::Log.debug($ERROR_POSITION)
        shell.kill!
      end
    end # block
  end # ruby_block
end

action :update do
  chef_gem "greenletters"
  require "greenletters"

  ruby_block "new_person::update::#{new_resource.full_name}" do
    block do
      shell = Greenletters::Process.new("sh", :transcript => new_resource.log, :timeout => node[:vista][:shell_timeout_seconds])

      # start the shell, set up GTM environment and start GTM shell
      shell.start!
      init_shell(shell)

      # edit Initial
      if new_resource.initial
        shell.wait_for(:output, /EDIT WHICH FIELD:/) do | process, match |
          process.write("1\r")
        end
      end
      if new_resource.primary_menu_option
        select_primary_menu_options(shell)
      end
      if new_resource.secondary_menu_options.any?
        select_secondary_menu_options(shell)
      end
      if new_resource.keys.any?
        select_keys(shell)
      end
      if new_resource.cprs_tab
        select_cprs_tab(shell)
      end
      if new_resource.ssn
        select_ssn(shell)
      end
      select_restrict_patients(shell)

      ######################
      # done specifying edit fields
      ######################
      shell.wait_for(:output, Regexp.union(node[:vista][:diedit_initial_field_regex], node[:vista][:diedit_next_field_regex])) do | process, match |
        process.write("\r")
      end

      ######################
      # Begin field input
      ######################
      @new_entry = select_new_person(shell, new_resource.full_name)

      if @new_entry == true
        Chef::Log.warn("#{new_resource.full_name} does not exist. Aborting new_person::update.\n")
        shell << "^\r"
        shell << "^\r"
      else    # new_entry == false
        if new_resource.initial
          shell.wait_for(:output, /INITIAL:/) do | process, match |
            process.write("#{new_resource.initial}\r")
          end
        end
        if new_resource.primary_menu_option
          expect_primary_menu_option(shell, new_resource.primary_menu_option)
        end
        if new_resource.secondary_menu_options.any?
          expect_secondary_menu_options(shell, new_resource.secondary_menu_options)
        end
        if new_resource.keys.any?
          expect_keys(shell, new_resource.keys)
        end
        if new_resource.cprs_tab
          expect_cprs_tab(shell, new_resource.cprs_tab)
        end
        if new_resource.ssn
          expect_ssn(shell, new_resource.ssn)
        end
        expect_restrict_patients(shell, false)

        Chef::Log.info("NEW PERSON (#{new_resource.full_name}) updated successfully.\n")
      end
      exit_shell(shell)
    end # block
  end # ruby_block
end
