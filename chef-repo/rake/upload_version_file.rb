
task :upload_version_file, [:nexus_url, :nexus_user, :nexus_pw] do |t,args|
  user = args[:nexus_user] || ENV["NEXUS_USER_NAME"]
  pw = args[:nexus_pw] || ENV["NEXUS_PASSWORD"]
  source = ""
  ENV.each do |name,value|
  	if name.include?("_VERSION") || name.include?("_PROVISION")
      source << "export #{name}=#{value}\n"
    end
  end
  File.write("#{File.expand_path("artifact_versions.sh", File.dirname(__FILE__))}", source)
  system "curl -v -F r=releases -F hasPom=false -F e=sh -F g=us.vistacore.version_files -F a=artifact_versions -F v=#{ENV['BUILD_IDENTIFIER']} -F p=sh -F file=@#{File.expand_path("artifact_versions.sh", File.dirname(__FILE__))} -u #{user}:#{pw} #{args[:nexus_url]}/nexus/service/local/artifact/maven/content"
end
