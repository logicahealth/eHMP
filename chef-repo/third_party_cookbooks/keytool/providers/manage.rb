require 'mixlib/shellout'

use_inline_resources

def load_current_resource
  pass = new_resource.storepass_file.nil? ? new_resource.storepass : ::File.open(new_resource.storepass_file).read.chomp("\n")

  @keytool = new_resource.keytool
  @keytool += " -keystore #{new_resource.keystore}"
  @keytool += " -storepass #{pass}"
  @keytool += " #{new_resource.additional}" unless new_resource.additional.nil?

  @cert_file = new_resource.file.nil? ? "/tmp/#{new_resource.cert_alias}.crt" : new_resource.file
end

def already_in_keystore?(cert_alias)
  keytool = @keytool + " -list  -alias #{new_resource.cert_alias}"

  cmd = Mixlib::ShellOut.new(keytool).run_command
  case cmd.status
    when 0
      true
    else
      false
  end
end

def is_current_pass?(pass)
  keytool = "#{new_resource.keytool} -keystore #{new_resource.keystore} -storepass #{pass} -list"

  cmd = Mixlib::ShellOut.new(keytool).run_command
  case cmd.status
    when 0
      true
    else
      false
  end
end

action :exportcert do
  @keytool += " -file #{@cert_file} -exportcert  -alias #{new_resource.cert_alias}"

  unless ::File.exists?(@cert_file)
    Mixlib::ShellOut.new(@keytool).run_command.error!
    Chef::Log.info("keytool_manage[#{new_resource.cert_alias}] exported to #{@cert_file}")
    new_resource.updated_by_last_action(true)
  end
end

action :importcert do
  @keytool += " -file #{@cert_file} -importcert  -alias #{new_resource.cert_alias}"
  @keytool.insert(0, 'echo yes | ')


  if ::File.exists?(@cert_file)
    unless already_in_keystore?(new_resource.cert_alias)
      Mixlib::ShellOut.new(@keytool).run_command.error!
      Chef::Log.info("keytool_manage[#{new_resource.cert_alias}] imported to #{new_resource.keystore}")
      new_resource.updated_by_last_action(true)
    end
  end
end

action :importkeystore do
  @keytool += " -file #{@cert_file} -importkeystore -srckeystore #{new_resource.file} -srcstoretype #{new_resource.srcstoretype} -srcstorepass #{new_resource.srcstorepass} -alias #{new_resource.cert_alias}"
  @keytool.insert(0, 'echo yes | ')


  if ::File.exists?(@cert_file)
    unless already_in_keystore?(new_resource.cert_alias)
      Mixlib::ShellOut.new(@keytool).run_command.error!
      Chef::Log.info("keytool_manage[#{new_resource.cert_alias}] imported to #{new_resource.keystore}")
      new_resource.updated_by_last_action(true)
    end
  end
end


action :deletecert do
  @keytool += " -delete  -alias #{new_resource.cert_alias}"

  if already_in_keystore?(new_resource.cert_alias)
    Mixlib::ShellOut.new(@keytool).run_command.error!
    Chef::Log.info("keytool_manage[#{new_resource.cert_alias}] deleted from #{new_resource.keystore}")
    new_resource.updated_by_last_action(true)
  end
end

action :storepasswd do
  @keytool += " -storepasswd -new #{new_resource.new_pass}"

  unless is_current_pass?(new_resource.new_pass)
    Mixlib::ShellOut.new(@keytool).run_command.error!
    Chef::Log.info("keytool_manage[#{new_resource.keystore}] changed storepass for #{new_resource.keystore}")
    new_resource.updated_by_last_action(true)
  end
end

action :createstore do
  @keytool = new_resource.keytool
  keytool_command= <<-eos
  -genkey -noprompt \
  -alias #{new_resource.keystore_alias} \
  -dname "CN=#{new_resource.common_name}, OU=#{new_resource.org_unit}, O=#{new_resource.org}, L=#{new_resource.location}, C=#{new_resource.country}" \
  -keystore #{new_resource.keystore} \
  -storepass #{new_resource.storepass} \
  -keypass #{new_resource.storepass}
eos
  @keytool += keytool_command

  unless ::File.exists?("#{new_resource.keystore}")
    Mixlib::ShellOut.new(@keytool).run_command.error!
    Chef::Log.info("keytool_manage[#{new_resource.keystore}] created new keystore #{new_resource.keystore}")
    new_resource.updated_by_last_action(true)
  end
end
