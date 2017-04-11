define :ehmp_ui_manifest, :path => "" do
  release_version = node[:'ehmp-ui_provision'][:artifacts][:'ehmp-ui'][:version].split(".")[0..2].join(".") rescue "unknown"

  overall_version = 0
  unset_versions = []
  versions = {}
  [
    "ehmp-ui_provision",
    "ehmp_provision",
    "rdk_provision",
    "cds_provision"
  ].each { |provision_cookbook|
    node[provision_cookbook.to_sym][:artifacts].each_pair do |name, coordinates|
      if coordinates[:version] == "LATEST" || coordinates[:version].nil?
        unset_versions << name
      end
      overall_version += coordinates[:version].to_s.sub("#{release_version}.","").to_i
      versions[name.to_sym] = coordinates[:version]
    end
  }
  overall_version = "#{release_version}.#{overall_version}"
  puts "The following artifacts are missing versions...\n#{unset_versions.inspect} \nThis means the overall version number is likely invalid."
  puts "overall_version = #{overall_version}"

  node.default[:'ehmp-ui_provision'][:manifest][:versions] = versions
  node.default[:'ehmp-ui_provision'][:manifest][:overall_version] = overall_version

  version_host_path = "/tmp/artifact-versions-shell-#{overall_version}.sh"

  File.open(version_host_path, "w") do |f|
    ENV.each do |key,value|
      if key.end_with?("_VERSION") || key.end_with?("_PROVISION")
        f.write("export #{key}=#{value}\n")
      end
    end
  end

  puts "\nAPP_VERSION='#{overall_version}'\n"
  if ENV.has_key?("UPLOAD_RELEASE_MANIFEST")

    chef_gem 'chef-vault' do
      version '2.6.1'
    end

    require 'chef-vault'

    nexus = ChefVault::Item.load(
      "jenkins", "nexus",
      node_name: Chef::Config['node_name'],
      client_key_path: Chef::Config['client_key']
    ).to_hash
    nexus_creds = nexus['credentials']

    execute "uploading artifact version shell to nexus" do
      command "curl -v -F r=releases -F hasPom=false -F e=sh -F g=us.vistacore -F a=artifact-versions-shell -F v=#{overall_version} -F p=sh -F file=@#{version_host_path} -u #{nexus_creds['username']}:#{nexus_creds['password']} #{node[:common][:nexus_url]}/nexus/service/local/artifact/maven/content"
    end

  end
end

