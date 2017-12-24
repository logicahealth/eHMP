action :execute do 

  config = read_json(new_resource.config)
  artifact_dir = ::File.dirname(new_resource.config)

  directory new_resource.config_dir do
    owner node[:crs][:user] 
    group node[:crs][:group]
    mode "0755"
    recursive true
  end

  config["custom_ttl_files"].each do |name, info|
    execute "delete_#{name}" do
      command "#{node[:crs][:fuseki][:home]}/bin/soh delete http://localhost:3030/#{info['data_set']} #{info['graph']}"
      returns (0..20).to_a
    end
    execute "post_#{name}" do
      command "#{node[:crs][:fuseki][:home]}/bin/soh post http://localhost:3030/#{info['data_set']} #{info['graph']} #{artifact_dir}/custom_ttl_files/#{name}"
    end
  end
end

def read_json(json_file)
  JSON.parse(::File.read(json_file))
end
