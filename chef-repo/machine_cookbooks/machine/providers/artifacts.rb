action :download do
  cookbook = new_resource.provisioner_cookbook || new_resource.name
  node[cookbook.to_sym][:artifacts].each_pair do |artifact, coords|
    directory "#{Chef::Config['file_cache_path']}/artifacts/#{coords[:artifact]}/#{coords[:version]}" do
      recursive true
      action :create
      only_if { coords[:release] }
    end

    remote_file "#{Chef::Config['file_cache_path']}/artifacts/#{coords[:artifact]}/#{coords[:version]}/#{coords[:artifact]}-#{coords[:version]}.#{coords[:extension]}" do
      use_conditional_get true
      source artifact_url(node[cookbook.to_sym][:artifacts][artifact])
      only_if { coords[:release] }
    end
    
    file "#{Chef::Config['file_cache_path']}/artifacts/#{coords[:artifact]}/#{coords[:version]}/coords.json" do
      path lazy { "#{Chef::Config['file_cache_path']}/artifacts/#{coords[:artifact]}/#{coords[:version]}/coords.json" }
      content lazy { JSON.pretty_generate(coords) }
      action :create
      only_if { coords[:release] }
    end
  end
end