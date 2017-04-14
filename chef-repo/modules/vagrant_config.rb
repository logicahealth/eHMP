def vagrant_config(args)
  @config = ""
  args.each { |key, value|
    case key
    when :box_name
      box_name(value)
    when :network
      network(value)
    when :synced_folders
      synced_folders(value)
    when :provider_config
      provider_config(value)
    end
  }
  return @config
end

def provider_config(args)
  args[:memory] = 512 if args[:memory].nil?
  add_line = "\n config.vm.provider \"#{args[:provider_name]}\""
  add_line << " do |v| \n"
  add_line << " v.name = \"#{args[:instance_name]}\"\n"
  add_line << " v.customize [\"modifyvm\", :id, \"--memory\", \"#{args[:memory]}\"]\n"
  add_line << " end\n"
  @config << add_line
end

def network(args)
  add_line = "config.vm.network \"#{args[:network_type]}\", ip: \"#{args[:ip_address]}\"\n"
  @config << add_line
end

def box_name(args)
  puts "box_name args: " + args.pretty_inspect
  add_line = "config.vm.box = \"#{args}\"\n"
  puts "adding line: #{add_line}"
  @config << add_line
end

def synced_folders(args)
  args.each { |folder|
    add_line = "config.vm.synced_folder \"#{folder[:host_path]}\", \"#{folder[:guest_path]}\", create: #{folder[:create]}\n"
    @config << add_line
  }
end