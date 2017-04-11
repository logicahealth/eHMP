desc "Upload one cookbook"
task :upload_cookbook, [:cookbook] do |t, args|
  upload_cookbook(args[:cookbook])
end

desc "Upload all cookbooks"
task :upload_all_cookbooks do
  uploaded_cookbooks = []
  cookbooks_to_upload = get_to_upload_cookbooks

  cookbooks_to_upload.each { |cookbook|
    dependencies = get_deps(cookbook, true)
    
    #Iterate over dependencies to see what needs to get uploaded
    dependencies.reverse.each { |dep|
      if(!uploaded_cookbooks.include?(dep) and cookbooks_to_upload.include?(dep) and dep != cookbook)
        #If it hasn't been uploaded, and it is in the cookbooks that have changed
        # upload the cookbook
        puts "Uploading #{dep}..."
        uploaded_cookbooks.push(dep)
        upload_cookbook(dep)
      end
    }

    ##Done uploading dependencies - now upload itself
    if(!uploaded_cookbooks.include?(cookbook))
      puts "Uploading #{cookbook}..."
      uploaded_cookbooks.push(cookbook)
      upload_cookbook(cookbook)
    end
  }
end

def get_to_upload_cookbooks
  server_cookbooks = get_cookbook_hash("server")
  local_cookbooks = get_cookbook_hash("local")
  to_upload = []

  local_cookbooks.each do |name, versions|
    versions.each do |version|
      to_upload << name if !to_upload.include?(name) and (server_cookbooks[name].nil? or !server_cookbooks[name].include?(version))
    end
  end
  return to_upload
end

def get_cookbook_hash(from)
  raw_cookbooks = `knife cookbook -a #{"-z " if from == "local"}list --config #{$knife_rb}`
  cookbook_hash = {}
  raw_cookbooks.split("\n").each do |rc|
    result = rc.match(/^(\S+)\s+(.*)/)
    # result[1] is the name of the cookbook, result[2] are the versions of it, separated by spaces
    cookbook_hash[result[1]] = result[2].split(" ")
  end
  return cookbook_hash
end

def get_deps(cookbook, local = true)
  zero = local ? '-z' : '' 
  `knife deps cookbooks/#{cookbook} --tree #{zero} --config #{$knife_rb} > temp.txt`
  deps = []
  File.open("temp.txt", "r") do |fi|
    fi.each_line do |line|
      cookbook = line.strip
      cookbook = cookbook[10..-1] ##To remove 'cookbooks/' in the string
      deps.push(cookbook)
    end
  end
  `rm temp.txt`
  return deps
end

def upload_cookbook(cookbook)
  ret = `knife cookbook upload #{cookbook} --freeze --config #{$knife_rb}`
  raise "Failed to upload cookbook #{cookbook}" unless $?.exitstatus==0
end
