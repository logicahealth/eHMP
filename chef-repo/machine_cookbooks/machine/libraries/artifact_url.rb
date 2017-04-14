def artifact_url(artifact)
	group = artifact[:group].gsub(".","/")
	url = "#{node[:common][:nexus_url]}/nexus/content/repositories/#{artifact[:repo]}/#{group}/#{artifact[:artifact]}/#{artifact[:version]}/#{artifact[:artifact]}-#{artifact[:version]}.#{artifact[:extension]}"
	url
end
