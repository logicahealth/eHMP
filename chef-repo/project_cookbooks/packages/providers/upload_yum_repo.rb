action :execute do

  chef_gem 'chef-vault' do
    version '2.6.1'
  end

  require 'chef-vault'

  nexus = ChefVault::Item.load(
    "jenkins", "nexus",
    node_name: "jenkins",
    client_key_path: "/jenkins.pem"
  ).to_hash
  nexus_creds = nexus['credentials']

  ruby_block "uploading installed yum packages to nexus" do
    block do
      upload_yum_cache(new_resource.yum_cache_path, new_resource.upload_url, nexus_creds["username"], nexus_creds["password"])
    end
  end
  
end

def upload_yum_cache(folder, nexus_url, username, password)
  Dir.chdir(folder) {
    Dir.glob("**/*.rpm").each { |package_path|
      package = ::File.basename(package_path)
      matches = package.scan(/(.*)-(\d+.*\-.*.rpm)/)
      puts "Uploading #{package}"
      `curl -v -u #{username}:#{password} --upload-file #{package_path}  #{nexus_url}/fakepath/#{matches[0][0]}/#{matches[0][1]}/#{package}`
    }
  }
end