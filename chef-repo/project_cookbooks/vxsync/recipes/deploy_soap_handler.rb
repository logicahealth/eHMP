#
# Cookbook Name:: vxsync
# Recipe:: deploy_soap_handler
#

include_recipe 'java_wrapper'

directory node[:terminology][:home_dir] do
  owner  'root'
  group  'root'
  mode "0755"
  recursive true
end

node[:terminology][:artifacts].each do |name, attributes|
  artifact_filename = "#{name}.zip"
  artifact_path = "#{Chef::Config['file_cache_path']}/#{artifact_filename}"
  artifact_fullname = "termdb-#{attributes[:version]}-#{name}"
  artifact_source = "#{node[:terminology][:nexus_base_url]}/#{attributes[:version]}/#{artifact_fullname}.zip"
  artifact_dir = "#{node[:terminology][:home_dir]}/#{attributes[:dir_name]}"

  remote_file artifact_path do
    use_conditional_get true
    source artifact_source
    mode   "0755"
    notifies :delete, "directory[#{artifact_dir}]", :immediately    
  end

  directory artifact_dir do
    recursive true
    action :nothing
  end

  execute "extract termdb #{artifact_filename}" do
    cwd node[:terminology][:home_dir]
    command "unzip #{artifact_path}"
    not_if { File.exists? artifact_dir }
    notifies :run, "execute[rename directory to #{attributes[:dir_name]}]", :immediately
    notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
  end

  execute "rename directory to #{attributes[:dir_name]}" do
    cwd node[:terminology][:home_dir]
    command "mv #{artifact_fullname} #{attributes[:dir_name]}"
    action :nothing
    notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
  end
end

directory node[:soap_handler][:home_dir] do
  owner  'root'
  group  'root'
  mode "0755"
  recursive true
  action :create
end

remote_file "#{node[:soap_handler][:artifact_path]}" do
  use_conditional_get true
  source node[:soap_handler][:source]
  mode   "0755"
end

file "#{node[:soap_handler][:home_dir]}/#{node[:soap_handler][:filename]}" do
  owner  'root'
  group  'root'
  mode   "0755"
  content lazy { IO.read(node[:soap_handler][:artifact_path]) }
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

hdr_sites = find_multiple_nodes_by_role("hdr", node[:stack], "mocks")
pgd = find_node_by_role("pgd", node[:stack], "mocks")
vler = find_node_by_role("vler", node[:stack], "mocks")
jmeadows = find_node_by_role("jmeadows", node[:stack], "mocks")
mvi = find_node_by_role("mvi", node[:stack], "mocks")
vxsync = find_node_by_role("vxsync", node[:stack])

template "#{node[:soap_handler][:home_dir]}/config.json" do
  source 'config.json.erb'
  owner 'root'
  group 'root'
  mode '0755'
  variables(
    :hdr_sites => hdr_sites,
    :pgd => pgd,
    :vler => vler,
    :jmeadows => jmeadows,
    :mvi => mvi,
    :soap_handler => node[:soap_handler],
    :vxsync => vxsync
  )
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

template "/etc/init/soap_handler.conf" do
  variables(
    :name => "soap_handler",
    :level => 2345
  )
  source 'upstart-bluepill.erb'
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end

template "/etc/bluepill/soap_handler.pill" do
  source 'bluepill-soap_handler.pill.erb'
  variables(
    :name => "soap_handler",
    :start_command => "java -jar #{node[:soap_handler][:home_dir]}/#{node[:soap_handler][:filename]} server #{node[:soap_handler][:config_file]}",
    :working_directory => node[:soap_handler][:home_dir],
    :log_directory => "/tmp"
  )
  notifies :execute, "vxsync_reset_sync[reset_vxsync]", :delayed
end 

service "soap_handler" do
  provider Chef::Provider::Service::Upstart
  restart_command "/sbin/stop soap_handler; /sbin/start soap_handler"
  action [:enable]
end
