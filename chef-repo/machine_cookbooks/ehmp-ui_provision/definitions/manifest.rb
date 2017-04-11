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

  template "#{params[:path]}-#{overall_version}.json" do
    source 'manifest.json.erb'
    variables(
      :overall_version => overall_version,
      :versions => versions
    )
  end

  node.default[:'ehmp-ui_provision'][:'ehmp-ui'][:copy_files].merge!(
    {
      params[:path] => "#{params[:path]}-#{overall_version}.json"
    }
  ) 

end

