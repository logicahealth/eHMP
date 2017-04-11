define :ehmp_ui_manifest, :path => "" do
  release_version = node[:'ehmp-ui_provision'][:artifacts][:'ehmp-ui'][:version].split(".")[0..2].join(".") rescue "unknown"

  overall_version = 0
  unset_versions = []
  versions = {}

  version_host_path = "/tmp/artifact-versions-shell.sh"
  File.open(version_host_path, "w") do |f|
    ENV.each do |key,value|
      if key.end_with?("_VERSION") || key.end_with?("_PROVISION") || key.end_with?("_HASH")
        f.write("export #{key}=#{value}\n")
      end
      if key.end_with?("_VERSION") && value != "LATEST" && !value.nil?
        overall_version += value.to_s.split(".").last.to_i
        versions[key.to_sym] = value.to_s
      end
    end
  end

  overall_version = "#{release_version}.#{overall_version}"
  puts "overall_version = #{overall_version}"
  puts "\nAPP_VERSION='#{overall_version}'\n"

  node.default[:'ehmp-ui_provision'][:manifest][:versions] = versions
  node.default[:'ehmp-ui_provision'][:manifest][:overall_version] = overall_version

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
