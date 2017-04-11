action :execute do 

  config = read_json(new_resource.config)
  artifact_dir = ::File.dirname(new_resource.config)

  directory new_resource.config_dir do
    owner  'root'
    group  'root'
    mode "0755"
    recursive true
  end
  
  config["data_sets"].each do |name|
    file "#{new_resource.config_dir}/#{name}" do
      content lazy { ::File.read("#{artifact_dir}/data_sets/#{name}") }
      owner "root"
      group "root"
      mode "0755"
      notifies :restart, "service[fuseki]", :immediately
    end
  end

  config["custom_ttl_files"].each do |name, info|
    execute "delete_#{name}" do
      command "#{node[:crs][:fuseki][:base]}/bin/soh delete http://localhost:3030/#{info['data_set']} #{info['graph']}"
      returns (0..20).to_a
    end

    execute "post_#{name}" do
      command "#{node[:crs][:fuseki][:base]}/bin/soh post http://localhost:3030/#{info['data_set']} #{info['graph']} #{artifact_dir}/custom_ttl_files/#{name}"
    end
  end

end

def read_json(json_file)
  JSON.parse(::File.read(json_file))
end
