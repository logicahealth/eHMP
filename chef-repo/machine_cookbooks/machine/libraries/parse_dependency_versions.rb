def parse_dependency_versions(provision_cookbook)
  new_dependencies = {}
  run_context.cookbook_collection[provision_cookbook].metadata.dependencies.each do |cookbook, md_version|
    version = md_version.split(" ")[1]
    new_dependencies[cookbook] = version
  end
  new_dependencies
end
