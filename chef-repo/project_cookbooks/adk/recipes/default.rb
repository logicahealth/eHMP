#
# Cookbook Name:: adk
# Recipe:: default
#

include_recipe "apache2::default"
include_recipe "apache2::mod_headers"
include_recipe "apache2::mod_proxy"
include_recipe "apache2::mod_proxy_http"

apache_site "default" do
  enable false
end

web_app "#{node[:adk][:dir]}.apache.config" do
  template "apache.conf.erb"
  variables ({
    :local => node[:adk][:apache_cache]
  })
  # document_root appDir
  document_root node[:adk][:home_dir]
  port node[:adk][:port]
end

raise %/

the node attribute's must be set

node[:adk][:source]

you should have set this in the ehmp-ui machine file.

/ if node[:adk][:source].nil? || node[:adk][:source].empty? 

remote_file node[:adk][:artifact_path] do
  source node[:adk][:source]
  use_conditional_get true
  notifies :create, "ruby_block[clean all ADK dir except app directory]", :immediately
  not_if ("mountpoint -q #{node[:adk][:home_dir]}")
end

ruby_block "clean all ADK dir except app directory" do
  block do
    Dir["#{node[:adk][:home_dir]}/*"].each do |filePath|
      next if(File.basename(filePath) == 'app')
      FileUtils.rm_rf(filePath)
    end
  end
  action :nothing
  notifies :run, "execute[extract_adk_artifact]", :immediately
  only_if { Dir.exists?(node[:adk][:home_dir]) }
end

directory node[:adk][:home_dir] do
  owner  node[:apache][:user]
  group  node[:apache][:group]
  mode "0755"
  recursive true
  notifies :run, "execute[extract_adk_artifact]", :immediately
end

execute "extract_adk_artifact" do
  cwd node[:adk][:home_dir]
  command "tar -xvf #{node[:adk][:artifact_path]}"
  action :nothing
  not_if ("mountpoint -q #{node[:adk][:home_dir]}")
end
