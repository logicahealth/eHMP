#
# Cookbook Name:: crs
# Recipe:: deploy_third_party
#

directory node['crs']['third_party_dir'] do
  user node[:crs][:user]
  group node[:crs][:group]
  recursive true
end

node[:crs][:deploy_third_party].each do |name, info|
  remote_file "#{Chef::Config[:file_cache_path]}/#{name}_#{info['coords']['version']}" do
    source "#{node[:nexus_url]}/nexus/content/repositories/#{info['coords']['repo']}/#{info['coords']['group']}/#{info['coords']['artifact']}/#{info['coords']['version']}/#{info['coords']['artifact']}-#{info['coords']['version']}.#{info['coords']['extension']}"
    mode "0755"
    use_conditional_get true
  end

  execute "delete_#{name}" do
    command "#{node[:crs][:fuseki][:home]}/bin/soh delete http://localhost:3030/#{info['data_set']} #{info['graph']}"
    returns (0..20).to_a
    action :nothing
  end

  execute "post_#{name}" do
    command "#{node[:crs][:fuseki][:home]}/bin/soh post http://localhost:3030/#{info['data_set']} #{info['graph']} #{node['crs']['third_party_dir']}/#{name}"
    action :nothing
  end

  file "#{node['crs']['third_party_dir']}/#{name}" do
    content lazy { IO.read("#{Chef::Config[:file_cache_path]}/#{name}_#{info['coords']['version']}") }
    action :create
    notifies :run, "execute[delete_#{name}]", :immediately
    notifies :run, "execute[post_#{name}]", :immediately
  end
end
